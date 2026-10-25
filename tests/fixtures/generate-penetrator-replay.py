"""Find a real seven-bag replay: fill a 9x4 well, then finish with held I.

The fixture drives ordinary native controls; it installs no game-state hooks.
Coordinates here follow the normative rotation geometry and are checked by the
browser replay through the production game. Only entropy and time are controlled.
"""
from pathlib import Path
import json,time
KINDS=['I','J','L','O','S','T','Z']
SPAWN={'I':[(0,1),(1,1),(2,1),(3,1)],'J':[(0,0),(0,1),(1,1),(2,1)],'L':[(2,0),(0,1),(1,1),(2,1)],'O':[(1,0),(2,0),(1,1),(2,1)],'S':[(1,0),(2,0),(0,1),(1,1)],'T':[(1,0),(0,1),(1,1),(2,1)],'Z':[(0,0),(1,0),(1,1),(2,1)]}
SHAPES={}
for kind,spawn in SPAWN.items():
    variants=[]
    for orientation in range(4):
        points=spawn[:];pivot=1.5 if kind=='I' else 1
        if kind!='O':
            for _ in range(orientation):points=[(int(2*pivot-y),int(x)) for x,y in points]
        if not any(set(points)==set(v[1]) for v in variants):variants.append((orientation,points))
    SHAPES[kind]=variants
FULL=(1<<36)-1
BASE=sum(1<<KINDS.index(k) for k in KINDS if k!='I')
EXTRA=[k for k in KINDS if k!='O']
start=time.monotonic();nodes=0;failed=set()
def drop(mask,points,x):
    if any(x+px<0 or x+px>=9 for px,py in points):return None
    def valid(y):return all(y+py<4 and (y+py<0 or not mask&(1<<((y+py)*9+x+px))) for px,py in points)
    y=-4
    while valid(y+1):y+=1
    if any(y+py<0 for px,py in points):return None
    added=sum(1<<((y+py)*9+x+px) for px,py in points);result=mask|added
    for col in range(9):
        gap=False
        for row in range(3,-1,-1):
            if result&(1<<(row*9+col)):
                if gap:return None
            else:gap=True
    return result,y,added

def solve(mask,base,extra):
    global nodes
    nodes+=1
    if nodes%1000==0 and time.monotonic()-start>20:raise RuntimeError('Bounded replay search expired')
    if mask==FULL:return [] if not base and extra.bit_count()==3 else None
    key=(mask,base,extra)
    if key in failed:return None
    kinds=[k for k in KINDS if base&(1<<KINDS.index(k))] if base else [k for k in EXTRA if not extra&(1<<KINDS.index(k))]
    if not base and extra.bit_count()>=3:return None
    if not base and extra.bit_count()==2 and not extra&(1<<KINDS.index('T')):kinds=['T']
    # Bottom-left coverage removes equivalent independent floor-placement orders.
    target=next(row*9+col for row in range(3,-1,-1) for col in range(9) if not mask&(1<<(row*9+col)))
    for kind in kinds:
        bit=1<<KINDS.index(kind)
        for orientation,points in SHAPES[kind]:
            for x in range(-2,9):
                placed=drop(mask,points,x)
                if placed is None:continue
                result,y,added=placed
                if not added&(1<<target):continue
                path=solve(result,base&~bit if base else 0,extra if base else extra|bit)
                if path is not None:return [{'kind':kind,'orientation':orientation,'x':x,'y':y+16}]+path
    failed.add(key);return None
plan=solve(0,BASE,0)
assert plan is not None,'No canonical replay found'
first=['I']+[p['kind'] for p in plan[:6]]
used=[p['kind'] for p in plan[6:]]
second=used+[k for k in KINDS if k not in used and k!='O']+['O']
third=['I','O','T','J','L','S','Z']
assert len(first)==len(second)==len(third)==7 and all(len(set(bag))==7 for bag in [first,second,third])
draws=[]
for bag in [first,second,third]:
    current=KINDS[:];target=list(reversed(bag))
    for i in range(6,0,-1):
        j=current.index(target[i],0,i+1);draws.append((j+.125)/(i+1));current[i],current[j]=current[j],current[i]
    assert current==target
output={'bags':[first,second,third],'draws':draws,'well':plan,'heldAfterClear':second[3],'dispose':second[4:6]}
Path(__file__).with_name('penetrator-replay.json').write_text(json.dumps(output,indent=2)+'\n')
print(json.dumps({'nodes':nodes,'seconds':time.monotonic()-start,'fixture':output}))


def comb(items, n=None):
    if n is None: n=len(items)
#    if len(items)<n: return []
#    if len(items)==n: return items
    for i in range(len(items)):
        v = items[i:i+1]
        if n==1:
            yield v
        else:
            rest = items[i+1:]
            for c in comb(rest, n-1):
                yield v+c



a = comb('abcde', 3)
for b in a: print b

# -*- coding: utf-8 -*-
# minify.py

import os
import sys
import gzip
import requests

files = ["navigo.js", "store.js", "underscore.js", "dayjs.min.js", "turpial-core.js", "turpial-resource.js", "tulipan.js"]

lines = [
    "/*!\n",
    "* Tulipan.js v1.1\n",
    "* (c) 2022 Nelson Carrasquel\n",
    "* Released under the MIT License.\n",
    "*/\n"
]

for _file in files:

    js_file = os.path.join("dev", _file)

    with open(js_file, 'r') as c:
        lines += c.readlines()

# Save temporary file
js_file = os.path.join("dist", "tulipan.js")

with open(js_file, 'w') as m:
    m.writelines(lines)

print("Writing of js files completed. See {}. . .".format(m.name))

# Grab the file contents
with open(js_file, 'r') as c:
    js = c.read()

# Pack it, ship it
payload = {'input': js}
url = 'https://javascript-minifier.com/raw'
print("Requesting mini-me of {}. . .".format(c.name))
r = requests.post(url, payload)

# Write out minified version
minified = js_file.rstrip('.js')+'.min.js'
with open(minified, 'w') as m:
    m.write(r.text)

print("Minification complete. See {}".format(m.name))

gzipped = js_file.rstrip('.js')+'.min.gz'
# Write out gzipped version

fp = open(minified, "rb")
data = fp.read()
bindata = bytearray(data)

with gzip.open(gzipped, "wb") as f:
    f.write(bindata)

print("Compression complete. See {}".format(f.name))

# Export for NPM module

print("Writing exports file for NPM module")

with open(js_file, 'r') as c:
    lines = c.readlines()

jsnext = lines[:]
lines.append("")
lines.append("\n\nmodule.exports = Tulipan;")

main_file = js_file.rstrip('.js')+'.cjs.js'

with open(main_file, 'w') as m:
    m.writelines(lines)

jsnext.append("")
jsnext.append("\n\nexport default Tulipan;")

module_file = js_file.rstrip('.js')+'.es.js'

with open(module_file, 'w') as m:
    m.writelines(jsnext)
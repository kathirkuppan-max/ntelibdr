#!/usr/bin/env python3.12
"""Generate standalone marketing pages per vertical: /engine/<slug> with own
title, meta, OG image, and autoplaying demo. Re-run any time; idempotent."""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')

V = {
 'safety':      ('Safety & Plumbing Equipment', 'Emergency showers, eyewash, freeze protection — quoted with Div 2 heat trace and scald valves, checked line by line.'),
 'hazloc':      ('Hazardous-Area Electrical', 'Class I Div 1/2 enclosures, purge panels, and certs — area classification drives every option the engine allows.'),
 'hvac':        ('Commercial HVAC', 'Air handlers, chillers, and controls — capacity, voltage, and refrigerant rules enforced before the number exists.'),
 'pumps':       ('Pumps & Packaged Skids', 'Pump curves, seal plans, and skid options — hydraulic selection validated against the duty point, not a lookup table.'),
 'lab':         ('Lab Furniture & Fume Hoods', 'Casework runs, hood face velocity, and SEFA compliance — layout and airflow rules priced together, not separately.'),
 'doors':       ('Fire Doors & Hardware', 'Openings schedules, fire ratings, and hardware sets — every leaf, frame, and closer checked against the label requirement.'),
 'cooling':     ('Cooling Towers', 'Tonnage, fan and basin options, drift and plume packages — thermal duty validated before the number exists.'),
 'medgas':      ('Medical Gas & Headwalls', 'NFPA 99 manifolds, alarms, outlets, and headwalls — pipeline sizing and compliance quoted as one system.'),
 'water':       ('Water Treatment', 'RO skids, filtration trains, and dosing — flow, recovery, and water chemistry rules priced together.'),
 'kitchen':     ('Kitchen Ventilation', 'Hoods, exhaust fans, and fire suppression — airflow balance and code clearances enforced in the quote.'),
 'cranes':      ('Cranes & Hoists', 'Span, capacity, and CMAA duty class — runway, hoist, and controls configured as one checked system.'),
 'boilers':     ('Commercial Boilers', 'Pressure ratings, burner turndown, and trim — ASME code options and venting validated line by line.'),
 'panels':      ('Control Panels & Switchgear', 'UL 508A panels and switchgear — breaker schedules, enclosure ratings, and heat loads checked before pricing.'),
 'electronics': ('Electronic Components & Assemblies', 'Connector series, gauge-vs-current derating, overmold and cert packages — compatibility and pricing as one checked assembly.'),
}
VIDEO = {'safety': 'nteli-quoting-explainer.mp4'}

TPL = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vertical-template.html')).read()

for slug, (name, cap) in V.items():
    vid = VIDEO.get(slug, f'nteli-quoting-{slug}.mp4')
    others = ' '.join(f'<a class="xv" href="/engine/{s}">{n}</a>'
                      for s, (n, _) in V.items() if s != slug)
    page = (TPL.replace('{{SLUG}}', slug).replace('{{NAME}}', name)
               .replace('{{CAP}}', cap).replace('{{VIDEO}}', vid)
               .replace('{{OTHERS}}', others))
    out = os.path.join(PUB, f'engine-{slug}.html')
    open(out, 'w').write(page)
    print('wrote', f'engine-{slug}.html')

# emit routes snippet for vercel.json
routes = [f'    {{ "src": "/engine/{s}", "dest": "/engine-{s}.html" }},' for s in V]
print('\n'.join(routes))

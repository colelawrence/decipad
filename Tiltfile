# Tiltfile for Decipad Development

# Install dependencies first
local_resource(
    'install-deps',
    cmd='mise run install-deps',
    labels=['setup']
)

# Build WASM with watch
local_resource(
    'wasm-build',
    serve_cmd='mise run build:wasm',
    resource_deps=['install-deps'],
    labels=['build'],
    allow_parallel=False
)

# Backend server (Architect sandbox - includes build step)
# The sandbox.sh script handles building the backend
local_resource(
    'backend',
    serve_cmd='mise run serve:backend',
    resource_deps=['install-deps', 'wasm-build'],
    labels=['serve'],
    readiness_probe=probe(
        http_get=http_get_action(port=3333, path='/')
    ),
    links=[
        link('http://localhost:3333', 'Backend Server')
    ]
)

# Frontend dev server
local_resource(
    'frontend',
    serve_cmd='mise run serve:frontend',
    resource_deps=['install-deps'],
    labels=['serve'],
    readiness_probe=probe(
        http_get=http_get_action(port=3000, path='/')
    ),
    links=[
        link('http://localhost:3000/w', 'Frontend Dev Server')
    ]
)

# Optional: Type checking as a separate resource
local_resource(
    'typecheck',
    serve_cmd='mise watch -t typecheck',
    resource_deps=['install-deps'],
    labels=['lint'],
    auto_init=False
)

# Optional: Storybook server
local_resource(
    'storybook',
    serve_cmd='mise run serve:storybook',
    resource_deps=['install-deps'],
    labels=['serve'],
    auto_init=False,
    readiness_probe=probe(
        http_get=http_get_action(port=4400, path='/')
    ),
    links=[
        link('http://localhost:4400', 'Storybook')
    ]
)

# Optional: Documentation server
local_resource(
    'docs',
    serve_cmd='mise run serve:docs',
    resource_deps=['install-deps'],
    labels=['serve'],
    auto_init=False,
    links=[
        link('http://localhost:4200', 'Documentation')
    ]
)

# Manual test task
local_resource(
    'tests',
    cmd='mise run test',
    resource_deps=['backend'],
    labels=['test'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    auto_init=False
)

# Manual lint task
local_resource(
    'lint',
    cmd='mise run lint',
    resource_deps=['install-deps'],
    labels=['lint'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    auto_init=False
)

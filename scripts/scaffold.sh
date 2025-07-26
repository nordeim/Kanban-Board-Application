#!/bin/bash

# Create directory structure
mkdir -p src/{app,components,lib,styles,types}
mkdir -p src/app/{api,"(auth)","(dashboard)"}
mkdir -p src/app/"(auth)"/{login,register,forgot-password}
mkdir -p src/app/"(dashboard)"/{board,deals,analytics,settings}
mkdir -p src/app/api/{auth,deals,webhooks}
mkdir -p src/components/{ui,board,deals,layout,shared,analytics}
mkdir -p src/lib/{auth,db,hooks,utils,validations,stores}
mkdir -p src/styles/themes
mkdir -p prisma/migrations
mkdir -p public/{images,fonts}
mkdir -p tests/{unit,integration,e2e}

# Create placeholder files
touch src/app/layout.tsx
touch src/app/page.tsx
touch src/app/globals.css
touch src/lib/utils.ts
touch prisma/schema.prisma
touch README.md
touch CONTRIBUTING.md
touch LICENSE

echo "✅ Project structure created successfully!"

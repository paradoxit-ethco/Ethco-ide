# Mila Frontend Demo Revision

## Scope

Mila is a frontend-only airline booking platform demo. It uses local JSON-style seed data and browser state for the prototype; authentication and persistence are intentionally demo-only until a backend is connected.

## Access model

| Role | Primary workspace | Main permissions in the demo |
|---|---|---|
| Super Admin | Control tower | Manage users, roles, bookings, routes, and workspace settings |
| Technical Team | Service desk | Monitor integrations, system health, incidents, and route synchronization |
| Client | Booking desk | Create bookings, review passenger records, and track booking status |

## Implementation checklist

- [ ] Rename the product UI to Mila.
- [ ] Add a landing page with clear sign-in and registration entry points.
- [ ] Add demo registration with role selection and local session state.
- [ ] Add demo sign-in with role-aware access and demo credentials.
- [ ] Add local JSON seed data for users, bookings, routes, and incidents.
- [ ] Add explicit role-based workspaces for Super Admin, Technical Team, and Client.
- [ ] Add user management for the Super Admin view.
- [ ] Make primary buttons functional with forms, dialogs, toasts, tabs, filters, and state updates.
- [ ] Verify English/Amharic labels, light/dark mode, mobile behavior, and role flows.
- [ ] Push the Mila revision into Ethco-ide.

# Transcendence

Recreation of a PONG game developed by [@DaveeHorvath](https://github.com/DaveeHorvath), [@madfcat](https://github.com/madfcat), [@nikkxll](https://github.com/nikkxll), [@dnapi](https://github.com/dnapi) and [@taoramo](https://github.com/taoramo)

## Table of Contents
- [Implemented modules](#implemented-modules)
  - [Mandatory part](#mandatory-part)
  - [Bonus part](#bonus-part)
- [Technical stack](#technical-stack)
- [Environment](#environment)
  - [Setting Up Environment Variables](#setting-up-environment-variables)
- [Install and run](#install-and-run)
- [Game](#game)

## Implemented modules

### Mandatory part
1. Framework as backend (major)
1. Front-end framework or toolkit (minor) + Database for the backend (minor)
1. Standard user management, authentication, users across tournaments (major)
1. Remote authentication (major)
1. Multiplayers (more than 2 in the same game) (major)
1. AI Opponent (major)
1. WAF/ModSecurity with Hardened Configuration and HashiCorp Vault for Secrets Management (major)

### Bonus part
1. Advanced 3D techniques (major)
1. Game Customization Options (minor) + Expanding Browser Compatibility (minor)

## Technical stack

[![Stack](https://skillicons.dev/icons?i=django,nginx,postgresql,javascript,css,html,bootstrap,threejs,ai,docker,figma)](https://skillicons.dev)

## Environment

The application requires the following environment variables to be configured. These variables control the app's behavior and connect it to external services. Ensure these variables are set before running the application.

| Variable Name               | Description                                                             | Example Value                         |
|-----------------------------|-------------------------------------------------------------------------|---------------------------------------|
| `DEBUG`                     | Set to `True` for development and `False` for production.              | `True` or `False`                     |
| `HCP_CLIENT_ID`             | The client ID for the HCP service.                                     | `your-client-id`                      |
| `HCP_CLIENT_SECRET`         | The client secret for the HCP service.                                 | `your-client-secret`                  |
| `OAUTH_REDIRECT`            | The OAuth redirect URI used during authentication.                     | `http://localhost:8000/callback`      |
| `OAUTH_AUTHORIZE_URL`       | The URL to the OAuth authorization endpoint.                           | `https://auth.example.com/authorize`  |
| `OAUTH_TOKEN_URL`           | The URL to the OAuth token endpoint.                                   | `https://auth.example.com/token`      |
| `OAUTH_API_URL`             | The base URL for the OAuth API.                                        | `https://api.example.com`             |
| `POSTGRES_USER`             | The username for connecting to the PostgreSQL database.                | `postgres`                            |
| `POSTGRES_HOST`             | The host for the PostgreSQL database.                                  | `localhost`                           |
| `POSTGRES_DB`               | The name of the PostgreSQL database.                                   | `my_database`                         |
| `POSTGRES_PASSWORD`         | The password for the PostgreSQL user.                                  | `yourpassword`                        |
| `DJANGO_HOST`               | The hostname or IP address for the Django server.                      | `127.0.0.1` or `0.0.0.0`              |
| `DJANGO_SUPERUSER_USERNAME` | The username for the default Django superuser.                         | `admin`                               |
| `DJANGO_SUPERUSER_EMAIL`    | The email for the default Django superuser.                            | `admin@example.com`                   |

### Setting Up Environment Variables

Follow these steps to configure the required environment variables:

Create a `.env` file

Place a file named `.env` in the root of your project directory with the following content (presented values are used just as an example, you should put your own instead):

```env
DEBUG=True
HCP_CLIENT_ID=your-client-id
HCP_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT=http://localhost:8000/callback
OAUTH_AUTHORIZE_URL=https://auth.example.com/authorize
OAUTH_TOKEN_URL=https://auth.example.com/token
OAUTH_API_URL=https://api.example.com
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=my_database
POSTGRES_PASSWORD=yourpassword
DJANGO_HOST=127.0.0.1
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
```

## Install and run

Clone the project repository
```
git clone git@github.com:DaveeHorvath/ascension.git
```

Go to the root of the project
```
cd ascension
```

Run command below to build and launch docker infrastructure
```
docker compose up --build
```

Then open browser at https://localhost:8443/

## Game

User interface of the game and menus presented below

<img width="1680" alt="1" src="https://github.com/user-attachments/assets/2661774b-ac29-478d-9f64-0760a0d0c84a" />

***Landing Page View***

<img width="1680" alt="2" src="https://github.com/user-attachments/assets/c98a6604-2291-4502-a6fe-44b6a4866ab5" />

***Single Game Lobby***

<img width="1680" alt="3" src="https://github.com/user-attachments/assets/be1af482-7b84-4a71-8fd3-119a651cf3a7" />

***Tournament Lobby***

<img width="1680" alt="4" src="https://github.com/user-attachments/assets/dc7d8d65-03f7-4700-95fb-1cdd357ee3ae" />

***Game View***

<img width="1680" alt="5" src="https://github.com/user-attachments/assets/a885d26c-f601-4003-a086-c7aa3ed23d4a" />

***Game View (3D Mode)***

##
dnikifor@student.hive.fi | LinkedIn: [dnikifor](https://www.linkedin.com/in/dmitriinikiforov/) | Tableau: [dmitriinikiforov](https://public.tableau.com/app/profile/nikiforov.dmitrii/vizzes)

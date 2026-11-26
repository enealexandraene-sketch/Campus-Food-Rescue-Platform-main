# Campus Food Rescue Platform – Requirements Analysis

## Prioritisation (MoSCoW)

| Priority | Meaning | Story map |
|---|---|---|
| **Must** | The platform can't fulfil its purpose without it. | MVP |
| **Should** | Important but the platform will work without. | Release 2 |
| **Could** | Nice to have, done if time allows. | Release 3 |

## Functional requirements

### Accounts and access

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | The system shall let a student register with their name, university email and a password, and shall activate the account once the email is verified. | Must |
| FR-2 | The system shall refuse a registration with an email that is already in use. | Must |
| FR-3 | The system shall let students, providers and maintainers log in with their email and password, and shall show the page that matches their role. | Must |
| FR-4 | The system shall lock an account temporarily after repeated failed login attempts. | Should |
| FR-5 | The system shall let students and providers reset a forgotten password through a link sent by email. | Should |
| FR-6 | The system shall let a provider submit a shop registration request with the shop's name, location and contact information. | Must |
| FR-7 | The system shall activate a provider account only after a maintainer has approved the request, and shall tell the provider the reason if it is rejected. | Must |

### Finding food (student)

| ID | Requirement | Priority |
|---|---|---|
| FR-8 | The system shall show students all visible listings that have portions left, favorite providers first, then newest first. | Must |
| FR-9 | The system shall show the details of a listing: the food, its allergens, the portions left, the pickup window and location, and the provider. | Must |
| FR-10 | The system shall let students filter listings by allergens to avoid, maximum distance and pickup time. | Should |
| FR-11 | The system shall show providers that currently have listings on a map. | Should |
| FR-12 | The system shall let students add providers to and remove them from a favorites list. | Could |

### Reservations (student)

| ID | Requirement | Priority |
|---|---|---|
| FR-13 | The system shall let a student reserve a portion of a listing only if portions are left, the pickup window hasn't passed, the student is within the provider's daily pick-up limit (if one is set) and isn't restricted. | Must |
| FR-14 | The system shall lower a listing's remaining portions on each reservation, raise it on each cancellation, and stop new reservations when it reaches zero. | Must |
| FR-15 | The system shall confirm each reservation and show its pickup window and location. | Must |
| FR-16 | The system shall show students their reservations with their status (upcoming, collected, cancelled, missed) and pickup details. | Must |
| FR-17 | The system shall let a student cancel an upcoming reservation until the end of its pickup window. | Must |

### Notifications and feedback

| ID | Requirement | Priority |
|---|---|---|
| FR-18 | The system shall notify the provider of every new and cancelled reservation. | Should |
| FR-19 | The system shall notify students when one of their reservations is cancelled by the provider or the platform. | Should |
| FR-20 | The system shall remind students of an uncollected reservation before its pickup window ends. | Should |
| FR-21 | The system shall send a push notification to students when a favorite provider publishes a listing. |
| FR-22 | The system shall show a provider's contact information and let students send them a message. | Should |
| FR-23 | The system shall let students and providers report an issue, with a description and an optional screenshot, and shall forward it to the maintainers. | Should |

### Shop and listings (provider)

| ID | Requirement | Priority |
|---|---|---|
| FR-24 | The system shall let a provider set the shop's pickup location and pickup window (e.g. 7 PM to 8 PM). | Must |
| FR-25 | The system shall let a provider set the shop's contact information and a maximum number of pick-ups per student per day. | Should |
| FR-26 | The system shall let a provider publish a listing with a name, a description, its allergens and a number of portions; allergens are mandatory. | Must |
| FR-27 | The system shall let a provider add a photo to a listing. | Should |
| FR-28 | The system shall let a provider keep a listing invisible to students until they choose to publish it. | Should |
| FR-29 | The system shall let a provider update a listing, but not lower its quantity below the portions already reserved. | Must |
| FR-30 | The system shall let a provider remove a listing. | Must |
| FR-31 | When a reserved listing is removed, the system shall cancel its reservations and notify the affected students. | Should |
| FR-32 | The system shall show providers their listings with remaining portions and the reservations for each listing. | Must |
| FR-33 | The system shall let providers repeat a listing daily or weekly. | Could |

### Pickups and abuse prevention (provider)

| ID | Requirement | Priority |
|---|---|---|
| FR-34 | The system shall let a provider mark a reservation as collected. | Must |
| FR-35 | The system shall record reservations still uncollected at the end of the pickup window as no-shows. | Should |
| FR-36 | The system shall show a provider a student's no-show history at their shop, and let the provider restrict the student, who can then no longer reserve food on the platform. | Could |

### Administration (maintainer)

| ID | Requirement | Priority |
|---|---|---|
| FR-37 | The system shall let a maintainer delete a provider, which removes their listings, cancels open reservations and notifies the provider and the affected students. | Could |

### Profile and impact

| ID | Requirement | Priority |
|---|---|---|
| FR-38 | The system shall let students manage a profile with a picture. | Could |
| FR-39 | The system shall show campus-wide impact statistics (meals saved, CO₂ avoided). | Could |
| FR-40 | The system shall show each provider their own impact statistics (food saved). | Could |

## Non-functional requirements

| ID | Category | Requirement | Priority | Stakeholder |
|---|---|---|---|---|
| NFR-1 | Usability | Registration shall ask only for a name, a university email and a password. | Must | Students |
| NFR-2 | Usability | The website shall be fully usable in a smartphone browser (screens from 360 px wide). | Must | Students, Providers |
| NFR-3 | Reliability | The system shall never accept more reservations than a listing has portions, even when students reserve at the same moment. | Must | Students, Providers |
| NFR-4 | Performance | The listing feed and a reservation shall respond within 2 seconds for 95 % of requests with 200 users online at the same time. | Should | Students |
| NFR-5 | Availability | The system shall be available 99 % of the time between 11:00 and 21:00 on weekdays. | Should | Students, Providers |
| NFR-6 | Security | Passwords shall be stored hashed (e.g. bcrypt), and all traffic shall use HTTPS. | Must | Maintainers |
| NFR-7 | Security | Users shall only access the functions of their role, and providers only the data of their own shop. | Must | Providers, Maintainers |
| NFR-8 | Privacy (GDPR) | The system shall collect only the data it needs, use the student's location only with their consent, show a student's no-show history only to the provider concerned, and let users delete their account and data. | Must | Students, Maintainers |
| NFR-9 | Privacy (GDPR) | Reservation and no-show history shall be deleted after 12 months. | Should | Students |
| NFR-10 | Maintainability | The system shall consist of one web application and one database, with documented setup, so that one maintainer can run it. | Should | University, Maintainers |
| NFR-11 | Cost | The system shall run on a single low-cost server or on University infrastructure. | Should | University |
| NFR-12 | Timeliness | Notifications shall be sent within 1 minute of the event that triggers them. | Could | Students |
| NFR-13 | Accessibility | The interface shall meet basic WCAG 2.1 AA rules (contrast, text alternatives, keyboard use). | Could | Students |

## Constraints and assumptions

**Constraints** :

- **Food safety:** every listing must declare its allergens (EU Regulation 1169/2011) and providers are the only responsible for the hygiene of the food.
- **Data protection:** the platform stores personal data (name, email, reservations, no-show history, location), so it must comply with the GDPR.
- **Budget:** the University wants the simplest possible app with low running and maintenance costs.
- **Hosting:** the University decides where the platform is hosted.

**Assumptions** :

- Food is offered for **same-day pickup only**. Each shop sets a pickup window (e.g. 7 PM to 8 PM) and students collect their food during it. The platform doesn't track expiry dates.
- The food is always free and the platform handles no payments.
- Only campus cafeterias and organizations can be providers, and a maintainer must approve each one.
- Students use the platform from a smartphone or computer browser.
- The daily pick-up limit applies per shop. A restriction applies to the whole platform: a restricted student can't reserve at any shop.

## Glossary

| Term | Definition |
|---|---|
| **Provider** | A campus cafeteria or organization that offers surplus food. Also called a shop. |
| **Maintainer** | A platform administrator who approves and removes providers and handles issue reports. |
| **Listing** | An offer of one kind of food by a provider, with a number of portions. |
| **Invisible listing** | A listing saved by the provider but not yet shown to students. |
| **Portion** | The unit a student reserves; one reservation is one portion. |
| **Reservation** | A portion set aside for a student. Its status is upcoming, collected, cancelled or missed. |
| **Pickup window** | The time slot set by the shop (e.g. 7 PM to 8 PM) during which students collect their reservations. |
| **Daily pick-up limit** | The maximum number of reservations one student can make at a shop per day. |
| **No-show** | A reservation that wasn't collected by the end of its pickup window. |
| **Favorite provider** | A provider that a student saved. Its listings appear first in the student's feed. |

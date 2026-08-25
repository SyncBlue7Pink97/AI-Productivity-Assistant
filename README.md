# Sibling Sync

Share

Build a mobile-first web app called SiblingSync.                                                                                                    DESIGN: Light blue #7AB8FF +Soft Pink #F8A8B8, rounded corners, soft shadows, kid-friendly, Material 3.                                                                                                                                                                      CONCEPT: Chore sharing app for sibling of different ages, designed for both urban AND rural families to end arguments. Fair, age-based rotation.                                                                                  ROLES: Parent (adds chores/rewards, approves proof) / Sibling (views tasks, uploads photo proof, swaps, redeems rewards)                                                                                                                       5 Screens:                                                                                                                                                                   1. Onboarding - Create Family / Join with code + Add sibling ages Location type (Urban/Rural)  2. Sibling home - "My Sync Today" list + Upload Proof + Swap                                                                    3. Parent Home - Weekly fairness bar chart + Pending Approvals + Add chore                                 4. Leaderboard - Points + streaks + age-adjusted fairness                                                                                   5. Rewards - Redeemable rewards                                                                                                                                     DATA MODEL:                                                                                                                                                                              ~ Family (location_type: urban/rural)                                                                                                                             ~ Users (name, role, age, points)                                                                                                                                    ~ Chores (title, points 10/20/30, minAge, category : indoor/outdoor/rural)                                                    ~ Assignments ( status, photoUrl)                                                                                                                                   ~ Rewards                                                                                                                                                                                      LOGIC:                                                                                                                                                                                            ~ filterChoresByAge(): 5-8 easy only, 9-12 Medium, 13+ Hard allowed. Show age badge.               ~ autoRotateChores(): No hard chore repeat 2 weeks in a row, weight points by age .                    ~rural mode: Include default rural chores: fetch water, feed chickens, collect firewood, sweep yard, herd goats. If rural selected, add "Offline Mode" - no photo required, just check box, low-data friendly.                                                                                                                                                                            Dummy data: Amahle (16), Thabo (11), Lindiwe (7) - Rural Family in Limpopo. Tasks: Amahle -fetch water (30pts), Thabo - sweep yard (20pts), Lindiwe - feed chickens (10pts

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/05726dcc-33a8-4b20-8014-53538333265d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

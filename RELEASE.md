# Wyrmbound: Starfall — iPhone release

The game in `starfall/` is wrapped as a native iPhone app with Capacitor (`ios/`). A GitHub Actions workflow builds it on a cloud Mac and uploads it to TestFlight, so no Mac is needed.

App details already set:

| | |
|---|---|
| Bundle ID | `com.painmakercak.starfall` |
| Name under the icon | Starfall |
| Devices | iPhone only, portrait |
| Version | from `package.json` (1.0.0); the build number goes up by one on every cloud build |

The bundle ID can't be changed once the app exists in App Store Connect, so change it in `capacitor.config.json` and `ios/App/App.xcodeproj/project.pbxproj` before step 2 if you want a different one.

## One-time setup (Kasey)

1. **Join the Apple Developer Program** (99 USD a year) at developer.apple.com/programs/enroll with your Apple Account. Use your legal name; it shows as the seller on the App Store.
2. **Create the app record.** In App Store Connect: Apps, then +, then New App.
   - Platform: iOS
   - Name: Wyrmbound: Starfall (pick another if it's taken)
   - Bundle ID: `com.painmakercak.starfall`. If it isn't in the list, register it first under Certificates, Identifiers & Profiles, then Identifiers.
   - SKU: anything, for example `starfall001`
3. **Make an API key for the cloud build.** In App Store Connect: Users and Access, then Integrations, then App Store Connect API.
   - If asked, request access and accept the terms.
   - Generate a Team key with the **Admin** role. Admin lets the build create the signing certificate by itself.
   - Download the `.p8` file. Apple only lets you download it once.
   - Note the **Key ID** and the **Issuer ID** shown on that page.
4. **Find your Team ID** under Membership details on developer.apple.com/account.
5. **Add 4 secrets to GitHub.** In the wyrmbound repo: Settings, then Secrets and variables, then Actions, then New repository secret.

   | Secret | Value |
   |---|---|
   | `ASC_KEY_ID` | the Key ID |
   | `ASC_ISSUER_ID` | the Issuer ID |
   | `ASC_KEY_P8` | the whole text of the `.p8` file, including the BEGIN and END lines |
   | `APPLE_TEAM_ID` | the Team ID |

   Never paste the key anywhere else or commit it to the repo.

## Each build

1. In the repo, open Actions, then **iOS TestFlight**, then **Run workflow**. It takes about 10 to 20 minutes.
2. Apple processes the upload for a few more minutes.
3. In App Store Connect, open the app's TestFlight tab and add yourself as an internal tester.
4. Install the **TestFlight** app on your iPhone and install Starfall from there.

## Before submitting for review

- Privacy policy URL: `https://painmakercak-prog.github.io/wyrmbound/starfall/privacy.html`
- App Privacy answers: **Data Not Collected**
- Support URL or email: still needed
- Age rating questionnaire: fantasy combat, no gambling with real money
- Screenshots: 6.9-inch iPhone
- Price and in-app purchases: still to decide. If geodes or Echo hatches are ever sold for real money, the odds of each result must be shown before purchase.
- Test mode is hidden in the app automatically; it only shows on the web version.

## What the app adds over the web version

- Saves are also kept in native iPhone storage, so iOS clearing web storage can't erase progress.
- Vibration on crits, skills, level ups, bosses and quest rewards. It can be turned off in the Lodge.
- An optional notification when the 8-hour offline haul is full. It's off until the player turns it on in the Lodge.
- Privacy policy inside the Lodge.

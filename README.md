# This is repo with nest experiments


## OAuth2 - related Experiments

Nice explanation videos: https://www.youtube.com/watch?v=PsbIGfvX900&ab_channel=productioncoder

### Authentication with cognito using SRP

Authentication flow for the Secure Remote Password (SRP) protocol. Your app collects your user's user name and password and generates an SRP that it passes to Amazon Cognito, instead of plaintext credentials.

Endpoints:
- auth/sign-up
- auth/sign-in
- auth/sign-up-confirm

CognitoAccessTokenGuard checks for token validity

### Authentication with cognito using OAuth2 - Authorization Code Grant (OPEN ID Connect)

Authorization code grant flow. Your app redirects the user to the authorization server (Amazon Cognito) where they sign in. Amazon Cognito then redirects the user back to your app with an authorization code.
App calls THIS backend in order to exchange code for tokens.

Endpoints:
- auth/token

CognitoAccessTokenGuard checks for token validity

This flow is a replacement for SRP flow, it is better because it allows to authenticate users not only with password but also with social providers like google, facebook etc.


### Authorization using OAuth2 - Authorization Code Grant - allow THIS backend to access google api in behalf of logged user

Endpoints:

- calendar/events - checks if google_access_token for logged user is in db if yes returns calendar events otherwise returns 401 http error and frontend should call calendar/google-auth-url to get google auth url.
As a next step this link should be opened in user browser, last step is to visit calendar/google-auth-callback with code and state params (google will redirect user to this endpoint after successful auth).
- calendar/google-auth-url - returns google auth url
- calendar/google-auth-callback - endpoint to be called by google after successful auth, it will exchange code for tokens and save them in database
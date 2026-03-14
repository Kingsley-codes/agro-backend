import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel.js";
import { generateUSerID } from "../controllers/authControllers.js";

interface UserJwtPayload extends JwtPayload {
  id: string;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (error: any, user?: UserJwtPayload | false) => void,
    ) => {
      try {
        const email = profile.emails?.[0]?.value ?? "";
        const firstName =
          profile.name?.givenName ?? profile.displayName ?? "Unknown";
        const lastName = profile.name?.familyName ?? "";
        const avatar = profile.photos?.[0]?.value;

        // 1. Check if a user already exists with this googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2. Maybe they signed up with email/password before — link accounts
          user = await User.findOne({ email });

          if (user) {
            // Link their existing account to Google
            user.googleId = profile.id;
            user.oauthProviders = { google: profile.id };
            if (!user.profilePhoto?.url && avatar) {
              user.profilePhoto = { publicId: "", url: avatar };
            }
            await user.save();
          } else {
            // 3. Brand new user — create an account
            user = await User.create({
              firstName,
              lastName,
              email,
              googleId: profile.id,
              oauthProviders: { google: profile.id },
              farmerID: generateUSerID(),
              profilePhoto: avatar ? { publicId: "", url: avatar } : undefined,
              isVerified: true, // Google emails are pre-verified
              // password is intentionally omitted — OAuth users don't need one
            });
          }
        }

        // 4. Block suspended users
        if (user.status === "suspended") {
          return done(null, false);
        }

        // 5. Build the JWT payload
        const payload: UserJwtPayload = {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          avatar: user.profilePhoto?.url,
        };

        return done(null, payload);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;

const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db/queries')
const prisma = require('../lib/prisma')

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await db.getUserByUsername(username);
            console.log('User at login', user)
                if(!user) {
                    return done(null, false, {message: 'No such user'})
                }
            const match = await bcrypt.compare(password, user.password);
                if(!match) {
                    return done(null, false, {message: 'Incorrect password'})
                }
            console.log('login success')
            return done(null, user);
        } catch(err) {
            return done(err)
        }
    })
)


passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
    try {
       const user = await prisma.user.findUnique({
      where: { id },
    });
        done(null, user);
    } catch(err) {
        done(err)
    }
});


module.exports = passport;
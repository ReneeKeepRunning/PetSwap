if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const expressError = require('./helper/expressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Client = require('./types/client');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const dogGroomingRoutes = require('./router/dogGrooming');
const reviewsRoutes = require('./router/reviews');
const clientRoutes = require('./router/client');
const contactRoutes = require('./router/contactUs');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/grooming'

mongoose.set('strictQuery', false);

mongoose.connect(dbUrl, {
    useNewUrlParser: true,       // 使用新的 URL 解析器
    useUnifiedTopology: true,   // 使用统一的拓扑结构
})
    .then(() => {
        console.log('Connected to MongoDB successfully!');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
    });

// 捕获未处理的 MongoDB 连接错误
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);

const secret = process.env.SECRET || 'this is pin'

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
    collection: "sessions"
})

store.on("error", function (e) {
    console.log("session store error", e)
})

app.use(session({
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}));


app.use(flash())

app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "img-src": ["'self'", "https: data:"],
            "script-src": ["'self'", "http: data:"]
        }
    })
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(Client.authenticate()))

passport.serializeUser(Client.serializeUser());
passport.deserializeUser(Client.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.signedClient = req.user || null;
    console.log("flashing message", res.locals);
    next();
})

app.use('/dogGrooming', dogGroomingRoutes)
app.use('/dogGrooming/:id/reviews', reviewsRoutes)
app.use('/contactUs', contactRoutes)
app.use('/', clientRoutes)


app.get('/', (req, res) => {
    console.log("signedClient:", req.user);
    res.render('home', { signedClient: req.user || null });
});

app.all('*', (req, res, next) => {
    next(new expressError('page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'sth went wrong!'
    res.status(statusCode).render('error', { err })
})

app.use(express.urlencoded({ extended: true }));


const port = process.env.PORT || 3000


app.listen(port, () => {
    console.log(`listening on ${port}`)
})

// if(!req.body.foundproduct) throw new expressError('invalid data')


/**
 * 
 * 1. npm install sendgrid
 * 2. integrate sendgride to backend
 * 3. register account on sendgrid website (free tier)
 * 4. send form data from front end to backend with an endpoint created
 * 5. controller behind the endpoint will store form data into database
 * 6. after sending email with sendgride npm package update the send status into "sent"
 * 
 */

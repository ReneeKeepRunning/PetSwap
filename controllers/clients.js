const Client = require('../types/client');

module.exports.registerForm = (req, res) => {
    console.log('Session at registerForm GET:', req.session);
    const formData = req.session.formData || {};
    delete req.session.formData;
    res.render('clients/register', {formData});
};

module.exports.registerFormPost = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new Client({ username, email });
    const newUser = await Client.register(user, password);

    req.login(newUser, err => {
      if (err) return next(err);
      req.flash('success', 'Successfully signed up.');
      res.redirect('/dogGrooming');
    });
  } catch (e) {
        if (e) {
            req.session.formData = { username, email };
            req.flash('error', e.message || 'Something went wrong.');
            req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.redirect('/register');
            }
            console.log('✅ Session saved with formData:', req.session);
            res.redirect('/register');
        });
  }
    };
}


module.exports.loginForm = (req, res) => {
    res.render('clients/login');
};

module.exports.loginFormPost = (req, res) => {
    req.flash('success', `Welcome back, ${req.body.username}`);
    const redirectUrl = res.locals.returnUrl || '/dogGrooming';
    delete res.locals.returnUrl;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Bye~ Hope to see you again!');
        res.redirect('/dogGrooming');
    });
};

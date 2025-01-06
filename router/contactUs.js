const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

router.get('/', (req, res) => {
    res.render('products/contactUs', { title: 'Contact Us', user: req.user || null });
});

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    console.log(`Message from ${name} (${email}): ${message}`);
    
    const msg = {
        to: 'tongruiyi1997@gmail.com', 
        from: 'tongruiyi1997@gmail.com', 
        subject: `New Contact Request from ${name}`,
        text: `You have received a new message from ${name} (${email}):\n\n${message}`,
        html: `
            <h1>New Contact Request</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `,
    };

    try {
        console.log('Sending email with the following message:');
        console.log(msg);
        await sgMail.send(msg);
        req.flash('success', 'successful.')
        res.redirect('/contactUs')
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send(console.log('something wrong!'));
        req.flash('error', e.message)
        res.redirect('/contactUs')
    }
});

module.exports = router;

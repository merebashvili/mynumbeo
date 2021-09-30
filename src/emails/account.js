const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
    to: email,
    from: 'merebashvili.work@gmail.com',
    subject: 'Welcome to mynumbeo!',
    text: `Welcome to mynumbeo, ${name}!
    This is a personlized analogue of numbeo.com
    Using mynumbeo, you will be able to create...`
})}

const sendAccountRemovalEmail = (email, name) => {
    sgMail.send({
    to: email,
    from: 'merebashvili.work@gmail.com',
    subject: 'Account removed',
    text: `We're sorry to see you go, ${name}.`
})}

module.exports = {
    sendWelcomeEmail,
    sendAccountRemovalEmail
}
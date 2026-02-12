const crypto = require('crypto');







const generateBankFingerPrint  = ({date, details, amount}) => {
  details = details.replace(/Ref-Coffee.*$/i, 'Ref-Coffee')
        const str = `${date}|${details}|${amount}`;
        return crypto.createHash('sha256').update(str).digest('hex')
}


module.exports = {
    generateBankFingerPrint
}
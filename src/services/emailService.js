require('dotenv').config();
import { reject } from "lodash";
import nodemailer from "nodemailer";

let sendSimpleEmail = async (dataSend) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });


    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Cường Nè 👻" <cuonglequang0410@gmail.com>', // sender address
        to: dataSend.reciverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh ", // Subject line
        html: getBodyHTMLEmail(dataSend),
    });

}
let getBodyHTMLEmail = (dataSend) => {
    let result = ''
    if (dataSend.language === 'vi') {
        result =
            `
        <h3>Xin chào ${dataSend.patientName}! </h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Care </p>
        <p>Thông tin đặt lịch khám bệnh: </p>
        <div><b>Thời gian: ${dataSend.time}  </b></div>
         <div><b>Bác sĩ : ${dataSend.doctorName}  </b></div>

         <p>Nếu các thông tin trên là đúng sự thật vui lòng click đường link 
         bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh </p>

         <div>
        <a href = ${dataSend.redirectLink} target ="_blank"> Click here</a>
         </div>

         <div> Xin chân thành cảm ơn</div>
        `
    }
    if (dataSend.language === 'en') {
        result =
            `
        <h3>Dear ${dataSend.patientName}! </h3>
        <p>You received this email because you booked an online medical appointment on Booking Care. </p>
        <p>Appointment information: </p>
        <div><b>Time: ${dataSend.time}  </b></div>
         <div><b>Doctor : ${dataSend.doctorName}  </b></div>

         <p>If the above information is correct, please click the link below
          to confirm and complete the appointment procedure. </p>

         <div>
        <a href = ${dataSend.redirectLink} target ="_blank"> Click here</a>
         </div>

         <div> Thanks so much!</div>
        `
    }
    return result
}
let getBodyHTMLEmailRemedy = (dataSend) => {
    let result = ''
    if (dataSend.language === 'vi') {
        result =
            `
        <h3>Xin chào ${dataSend.patientName}! </h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Care thành công </p>
        <p>Thông tin đơn thuốc / hóa đơn được gửi trong file đính kèm. </p>
    
         <div> Xin chân thành cảm ơn</div>
        `
    }
    if (dataSend.language === 'en') {
        result =
            `
        <h3>Dear ${dataSend.patientName}! </h3>
        <p>You received this email because you booked an online medical appointment on Booking Care. </p>
      

         <p>If the above information is correct, please click the link below
          to confirm and complete the appointment procedure. </p>

          <p>bla </p>

         <div> Thanks so much!</div>
        `
    }
    return result
}
let sendAttachment = async (dataSend) => {
    return new Promise(async (resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for port 465, false for other ports
                auth: {
                    user: process.env.EMAIL_APP,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });


            // send mail with defined transport object
            const info = await transporter.sendMail({
                from: '"Cường Nè 👻" <cuonglequang0410@gmail.com>', // sender address
                to: dataSend.email, // list of receivers
                subject: "Kết quả đặt lịch khám bệnh ", // Subject line
                html: getBodyHTMLEmailRemedy(dataSend),
                attachments: [
                    {
                        //encoded string as an attachments
                        filename: `remedy-${dataSend.patientId} - ${new Date().getTime()}.png`,
                        content: dataSend.imgBase64.split("base64,")[1],
                        encoding: "base64"
                    }

                ],
            });

            resolve()
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    sendSimpleEmail: sendSimpleEmail,
    sendAttachment: sendAttachment
}
import db from "../models/index"
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);


let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword)
        } catch (e) {
            reject(e);
        }
    })
}
let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {

            let userData = {};

            let isExist = await checkUserEmail(email);
            if (isExist) {
                // user already exist

                let user = await db.User.findOne({
                    where: { email: email },
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
                    raw: true,

                });
                if (user) {
                    // compare password
                    let check = await bcrypt.compare(password, user.password);
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'ok';

                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'wrong password';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User's not found`
                }

            } else {
                //return error
                userData.errCode = 1;
                userData.errMessage = `Your's Email isn't exist in your system.Pls try other email!`
            }
            resolve(userData)
        } catch (e) {
            reject(e)
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            });
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e)
        }
    })
}
let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === "ALL") {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password'] //bo dong password
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)
        } catch (e) {
            reject(e)
        }
    })
}
let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check email is exist??
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: "Your email is already in used, Pls try another email!!"
                })
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar
                })
                resolve({
                    errCode: 0,
                    errMessage: "ok"
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}
let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: userId }
        })
        if (!user) {
            resolve({
                errCode: 2,
                errMessage: `The user isn't exist`
            })
        }
        await db.User.destroy({
            where: { id: userId }
        })
        resolve({
            errCode: 0,
            message: `The user is delete`
        })
    })
}
let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: `Missing required paraments!`
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                user.image = data.avatar;
                await user.save()

                resolve({
                    errCode: 0,
                    message: `Update user success!`
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: `User not found!`
                });
            }
        } catch (e) {
            reject(e)
        }
    })
}
let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required paraments!'
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res)
            }
        } catch (e) {
            reject(e)
        }
    })
}
// === Định nghĩa hàm checkEmailExists tại đây ===
let checkEmailExists = async (email) => {
    try {
        const domain = email.split('@')[1];
        const mxRecords = await resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
            throw new Error('No MX records found for this email domain');
        }
        return true;
    } catch (err) {
        console.error('Error checking MX records:', err.message);
        throw new Error('Không tìm thấy địa chỉ email này!');
    }
};
let postPatientBookingAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Validate email
            if (!data.email) {
                resolve({
                    errCode: 1,
                    errMessage: 'Vui lòng nhập email!'
                });
                return;
            }

            const emailRegex = /^[^\s@]+@gmail\.com$/;
            if (!emailRegex.test(data.email)) {
                resolve({
                    errCode: 1,
                    errMessage: 'Email không hợp lệ! Phải là email Gmail (ví dụ: ten@gmail.com).'
                });
                return;
            }

            // Kiểm tra email bằng email-validator
            if (!emailValidator.validate(data.email)) {
                resolve({
                    errCode: 1,
                    errMessage: 'Email không hợp lệ!'
                });
                return;
            }

            // Kiểm tra email có tồn tại trong hệ thống không
            let isExist = await checkUserEmail(data.email);
            if (!isExist) {
                resolve({
                    errCode: 1,
                    errMessage: 'Email không tồn tại trong hệ thống. Vui lòng đăng ký tài khoản trước!'
                });
                return;
            }

            // Kiểm tra email có thực sự tồn tại không (dùng MX records)
            const emailExists = await checkEmailExists(data.email);
            if (!emailExists) {
                resolve({
                    errCode: 1,
                    errMessage: 'Không tìm thấy địa chỉ email này!'
                });
                return;
            }

            // Lấy thông tin bệnh nhân
            let patient = await db.User.findOne({
                where: { email: data.email },
                raw: true
            });

            if (!patient) {
                resolve({
                    errCode: 1,
                    errMessage: 'Không tìm thấy bệnh nhân với email này!'
                });
                return;
            }

            let token = uuidv4();
            // Lưu dữ liệu vào bảng Booking
            let booking = await db.Booking.create({
                statusId: 'S1',
                doctorId: data.doctorId,
                patientId: patient.id,
                date: data.date,
                timeType: data.timeType,
                reason: data.reason,
                token: token
            });

            // Gửi email xác nhận đặt lịch tới email người dùng
            const msg = {
                to: data.email,
                from: 'your_email@example.com', // Thay bằng email của bạn
                subject: 'Xác nhận đặt lịch khám',
                text: `Vui lòng xác nhận đặt lịch khám tại link: http://localhost:3000/verify-booking?token=${token}&doctorId=${data.doctorId}`,
                html: `<p>Vui lòng xác nhận đặt lịch khám tại <a href="http://localhost:3000/verify-booking?token=${token}&doctorId=${data.doctorId}">đây</a></p>`,
            };

            try {
                await sgMail.send(msg);
            } catch (err) {
                console.error('Error sending booking confirmation email:', err);
                // Xóa bản ghi vừa tạo nếu gửi email thất bại
                await db.Booking.destroy({
                    where: { id: booking.id }
                });
                resolve({
                    errCode: 1,
                    errMessage: 'Không thể gửi email xác nhận. Vui lòng thử lại!'
                });
                return;
            }

            resolve({
                errCode: 0,
                errMessage: 'Đặt lịch thành công! Vui lòng kiểm tra email để xác nhận.'
            });
        } catch (e) {
            console.error('Error in postPatientBookingAppointment:', e);
            resolve({
                errCode: 1,
                errMessage: 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!'
            });
        }
    });
};



module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService,
    postPatientBookingAppointment: postPatientBookingAppointment,

}
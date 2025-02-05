const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const upload = require('../Config/upload');
const { sendotpEmail } = require('../utils/email');

const userController = {
    async signup(req, res) {
        try {
          
            // const user = req.user;
            const { firstName, lastName, email, password } = req.body;

            // Check if all required fields are present
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            //check if user already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            let profilePicture = null;
            if (req.file && req.file.filename) {
                profilePicture = `/uploads/${req.file.filename}`;
                console.log(profilePicture);
            }

            // create a new user
            const newUser = await User.create({
                firstName,
                lastName,
                email,
                password,
                profilePicture,
            });

            //remove password from response
            const userResponse = newUser.toJSON();
            delete userResponse.password;

            const otp = Math.floor(1000 + Math.random() * 9000);
            console.log(otp);   
            console.log(email);
            // save otp and expiry to user
            await newUser.update({
                resetOtp : otp,
                resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000)
            })
            console.log(newUser);

            //send otp mail
            await sendotpEmail(email, otp);

            res.status(201).json({
                message: 'User created successfully',
                user: userResponse
            })

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            //find user by email
            const user = await User.findOne({ where: { email } });
            console.log(user);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }


            //validate password
            const password_valid = await user.validatePassword(password);
            if (!password_valid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }


            //Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.Jwt_Secret,
                { expiresIn: '24h' }
            )

            //remove password from response
            const userResponse = user.toJSON();
            delete userResponse.password;


            res.json({
                status: 'success',
                token,
                user: userResponse
            })
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async getProfile(req, res) {
        try {
            const user = req.user;
            const userProfile = await User.findOne({ where: { id: user.id } });
            res.json({
                status: 'success',
                user: userProfile
            })
        } catch (error) {
            console.error('Get Prfile Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async generateUsername(req, res) {
        try {
            const { firstName, lastName } = req.body;

            if (!firstName || !lastName) {
                return res.status(400).json({ message: 'First name and last name are required' });
            }
            const replacement_char = '_';
            const slug = slugify(firstName + replacement_char + lastName, {
                replacement: replacement_char,  // replace spaces with replacement character, defaults to `-`
                lower: false,      // convert to lower case, defaults to `false`
                strict: true,     // strip special characters except replacement, defaults to `false`
                locale: 'vi',      // language code of the locale to use
                trim: true         // trim leading and trailing replacement chars, defaults to `true`
            })


            const randomNumber = Math.floor(Math.random() * 1000);
            const username = `${slug}${replacement_char}${randomNumber}`;

            res.json({
                status: 'success',
                username
            });


        } catch (error) {
            console.error('Error generating username', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async updateProfile(req, res) {
        try {
            const user = req.user;
            const { firstName, lastName, email } = req.body;
    
            if (!req.file) {
                return res.status(400).json({ message: 'Profile picture is required' });
            }

            const profilePicture = `/uploads/${req.file.filename}`;
    
            // Update User Profile
            await User.update(
                {
                    firstName,
                    lastName,
                    email,
                    profilePicture: profilePicture,
                },
                { where: { id: user.id } }
            );
    
            // Fetch the updated user
            const updatedUser = await User.findByPk(user.id);
            const userResponse = updatedUser.toJSON();
            delete userResponse.password;
    
            res.json({
                status: 'success',
                user: userResponse
            });
    
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async forgotPassword(req , res) {
        try {
            const { email } = req.body;

            // validate email
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            // find user by email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }   

            // generate 4 digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000);
            console.log(otp);   
            console.log(email);
            // save otp and expiry to user
            await user.update({
                resetOtp : otp,
                resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000)
            })
            console.log(user);

            //send otp mail
            await sendotpEmail(email, otp);

            res.status(200).json({ message: 'OTP sent to your email' });    
        } catch (error) {
            console.error('Forgot Password Error:', error);

            //if there was an error, reset the otp fields
            if(User) {
                await User.update({
                    resetOtp : null,
                    resetOtpExpiry: null
                })
            }

            res.status(500).json({ 
                message: 'Error Sending OTP',
                status: 'error',
                details: error.message
            });
        }

    },

    async verifyOtp(req, res) {
        try {
            const { email, otp, isSignup } = req.body;

            // validate email and otp
            if (!email || !otp) {
                return res.status(400).json({ message: 'Email and OTP are required' });
            }

            // find user by email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // check if otp is valid and not expired
            if (user.resetOtp !== otp || user.resetOtpExpiry < new Date()) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            // clear otp fields and update isVerified if isSignup is true
            await user.update({
                resetOtp: null,
                resetOtpExpiry: null,
                isVerified: isSignup ? true : user.isVerified
            });

            res.status(200).json({ message: 'OTP verified successfully' });
        } catch (error) {
            console.error('Error verifying OTP:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async resetPassword(req, res){
   
        try {
            const { newPassword, confirmPassword, email } = req.body;
            //validate new password and confirm password
            if(!newPassword || !confirmPassword) {
                return res.status(400).json({ message: 'New password and confirm password are required' });
            }
            if(newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New password and confirm password do not match' });
            }
            //find user by email
            const user = await User.findOne({ where: { email } });
            user.update({
                password: newPassword
            })
            
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal Server Error' });
            
        }
    }
    
}


module.exports = userController;
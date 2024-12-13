const CareTaker = require('../models/careTaker-model');

const careTakerValidation = {
    // userId: {
    //     custom: {
    //         options: async function (value, { req }) {
    //             const caretaker = await CareTaker.findOne({ userId: req.user.id });
    //             if (caretaker) {
    //                 throw new Error("User already exists");
    //             } else {
    //                 return true;
    //             }
    //         }
    //     }
    // },
    careTakerBusinessName: {
        exists: {
            errorMessage: "CareTaker name is required"
        },
        notEmpty: {
            errorMessage: "CareTaker name cannot be blank"
        },
        trim: true
    },
    address: {
        exists: {
            errorMessage: "Address is required"
        },
        notEmpty: {
            errorMessage: "Address cannot be empty"
        },
        trim: true
    },
    photo: {
        custom: {
            options: function (value, { req }) {
                if (!req.files || !req.files.photo || req.files.photo.length === 0) {
                    throw new Error("Photo is required");
                }
                return true;
            }
        }
    },
    proof: {
        custom: {
            options: function (value, { req }) {
                if (!req.files || !req.files.proof || req.files.proof.length === 0) {
                    throw new Error("Proof is required");
                }
                return true;
            }
        }
    },
    bio: {
        exists: {
            errorMessage: "Bio is required"
        },
        notEmpty: {
            errorMessage: "Bio cannot be empty"
        },
        trim: true
    },
    serviceCharges: {
        custom: {
            options: (value) => {
                try {
                    // Check if value is a JSON string and parse it
                    const serviceCharges = typeof value === 'string' ? JSON.parse(value) : value;
                    // Validate that it's an array of objects with the required fields
                    if (!Array.isArray(serviceCharges)) {
                        throw new Error('Service charges must be an array.');
                    }
                    serviceCharges.forEach(charge => {
                        if (typeof charge.name !== 'string' || typeof charge.amount !== 'number' || typeof charge.time !== 'string') {
                            throw new Error('Each service charge must be an object with name (string), amount (number), and time (string).');
                        }
                    });
                    return true;
                } catch (error) {
                    throw new Error('Service charges must be a valid JSON array of objects.');
                }
            }
        }
    }
};


const careTakerUpdateValidation= {
    careTakerBusinessName: {
        optional: true,
        exists: {
            errorMessage: "CareTaker name is required"
        },
        notEmpty: {
            errorMessage: "CareTaker name cannot be blank"
        },
        trim: true
    },
    address: {
        optional: true,
        exists: {
            errorMessage: "Address is required"
        },
        notEmpty: {
            errorMessage: "Address cannot be empty"
        },
        trim: true
    },
    photo: {
        optional: true,
        custom: {
            options: function (value, { req }) {
                if (req.files && req.files.photo && req.files.photo.length > 0) {
                    return true;
                }
                return true;
            }
        }
    },
    proof: {
        optional: true,
        custom: {
            options: function (value, { req }) {
                if (req.files && req.files.proof && req.files.proof.length > 0) {
                    return true;
                }
                return true;
            }
        }
    },
    bio: {
        optional: true,
        exists: {
            errorMessage: "Bio is required"
        },
        notEmpty: {
            errorMessage: "Bio cannot be empty"
        },
        trim: true
    },
    serviceCharges: {
        custom: {
            options: (value) => {
                try {
                    // Check if value is a JSON string and parse it
                    const serviceCharges = typeof value === 'string' ? JSON.parse(value) : value;

                    // Validate that it's an array of objects with the required fields
                    if (!Array.isArray(serviceCharges)) {
                        throw new Error('Service charges must be an array.');
                    }

                    serviceCharges.forEach(charge => {
                        if (typeof charge.name !== 'string' || typeof charge.amount !== 'number' || typeof charge.time !== 'string') {
                            throw new Error('Each service charge must be an object with name (string), amount (number), and time (string).');
                        }
                    });

                    return true;
                } catch (error) {
                    throw new Error('Service charges must be a valid JSON array of objects.');
                }
            }
        }
    }
};

module.exports = {
    careTakerValidation,
    careTakerUpdateValidation
}
<template>
    <v-card>
        <!-- Header Bar -->
        <v-sheet
            tile
            color="secondary"
            class="d-flex align-center pa-2 white--text"
        >
            <v-icon class="mr-3" color="white">person</v-icon>
            <h2>
                {{ signUp ? "Create Account" : "Log in to Hark.tv" }}
            </h2>
        </v-sheet>

        <!-- Body Content -->
        <v-card-text class="px-4 py-0">
            <v-form ref="loginForm" v-model="valid" onSubmit="return false">
                <div class="mt-4" />
                <!-- Username Field -->
                <v-text-field
                    v-if="signUp"
                    id="username"
                    key="username"
                    ref="username"
                    v-model="user.username"
                    label="Username"
                    autocomplete="off"
                    required
                    solo
                    light
                    :loading="loading"
                    :disabled="loading"
                    tabindex="1"
                    autofocus
                    @change="checkUsername"
                    :error-messages="usernameError"
                    :success-messages="usernameSuccess"
                />

                <!-- Email Field -->
                <v-text-field
                    id="email"
                    key="email"
                    v-model="user.email"
                    :rules="rules.email"
                    label="E-mail"
                    autocomplete="email"
                    required
                    validate-on-blur
                    solo
                    light
                    :disabled="loading"
                    tabindex="2"
                    :autofocus="!signUp"
                />

                <!-- Password Field -->
                <v-text-field
                    id="password"
                    key="password"
                    v-model="user.password"
                    :append-icon="
                        showPassword ? 'visibility' : 'visibility_off'
                    "
                    :rules="[rules.required, rules.min]"
                    :type="showPassword ? 'text' : 'password'"
                    name="input-10-1"
                    label="Password"
                    hint="At least 8 characters."
                    autocomplete="password"
                    validate-on-blur
                    solo
                    light
                    :disabled="loading"
                    @click:append="showPassword = !showPassword"
                    tabindex="3"
                    :persistent-hint="signUp"
                />

                <!-- 18+ Confirmation / cover your ass legally -->
                <v-checkbox
                    v-if="signUp"
                    label="I confirm that I am 18 years of age or older."
                    color="primary"
                    class="pt-0 mt-0 mb-2"
                    :rules="[rules.adultCheck]"
                    validate-on-blur
                    :disabled="loading"
                    tabindex="4"
                    dense
                    hide-details
                />

                <!-- HCAPTCHA -->
                <div v-if="signUp" class="d-flex mb-2" style="min-height: 75px">
                    <v-hcaptcha
                        tabindex="5"
                        :key="attempts"
                        @verify="onCaptchaVerify"
                        @expired="onCaptchaExpired"
                        @error="onCaptchaError"
                    />
                </div>

                <!-- Login Button -->
                <v-btn
                    v-if="!signUp"
                    block
                    color="secondary"
                    :loading="loading"
                    type="submit"
                    @click="signIn(user.email, user.password)"
                    tabindex="6"
                    >Login</v-btn
                >

                <!-- Stay Logged In Checkbox -->
                <div class="d-flex">
                    <v-checkbox
                        v-if="!signUp"
                        id="remember-me"
                        v-model="shouldStayLoggedIn"
                        label="Stay logged in"
                        hide-details
                        color="secondary"
                        class="pt-0 mb-3"
                        :disabled="loading"
                    />
                </div>

                <!-- Register Button -->
                <v-btn
                    v-if="signUp"
                    block
                    color="primary"
                    class="white--text"
                    :loading="loading"
                    type="submit"
                    @click="createHcaptchaUser"
                    tabindex="6 "
                    >Register
                </v-btn>

                <!-- Some Cover Your Ass Legal Text -->
                <div v-if="signUp" class="my-2 grey--text" style="font-size:0.9em;">
                        By clicking register you agree to our
                        <a stylehref="/tos">Terms of Service</a>.
                </div>

                <br>

                <!-- General Success / Error Alert -->
                <v-alert
                    v-model="alert"
                    class="mt-4 mb-4"
                    dismissible
                    :type="alertType"
                    transition="expand-transition"
                    dense
                    >{{ alertMessage }}</v-alert
                >
            </v-form>
        </v-card-text>
        <v-divider />

        <!-- Bottom Actions Buttons -->
        <v-card-actions class="flex-wrap-reverse justify-space-around">
            <v-btn small :ripple="false" text depressed color="secondary" @click="resetPassword(user.email)"
                >Forgot Your Password?</v-btn
            >
            <!--<v-btn color="secondary" text class="mr-2" @click="$emit('close')"
                >CANCEL</v-btn
            >
            -->
            <v-btn small :ripple="false" color="primary" text @click="switchForm">{{
                signUp ? "Login Instead" : "Sign Up Instead"
            }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { auth } from "@/plugins/firebase.js";
import { db } from "@/plugins/firebase";

export default {
    name: "LoginDialog",

    props: {
        initialSignUp: {
            default: false,
            type: Boolean,
        },
    },

    data() {
        return {
            unsubAuthChanged: null,
            signUp: this.initialSignUp,
            loading: false,
            alert: false,
            alertMessage: "",
            alertType: "error",
            valid: true,
            user: {
                username: "",
                email: "",
                password: "",
            },
            showPassword: false,
            shouldStayLoggedIn: true,

            usernameError: "",
            usernameSuccess: "",

            captchaToken: null,
            attempts: 0,

            rules: {
                adultCheck: (val) => val || "You must be 18 to use this site.",
                required: (value) => !!value || "Password is required.",
                min: (value) =>
                    (value && value.length >= 8) || "Min 8 characters.",
                name: (v) => !!v || "Name is required.",
                email: [
                    (v) => !!v || "Email is required.",
                    (v) => /.+@.+/.test(v) || "E-mail must be valid.",
                ],
            },
        };
    },

    methods: {
        // Toggle Form Mode
        switchForm() {
            this.signUp = !this.signUp;
            this.resetValidation();
            this.hideAlert();
            this.reset();
        },

        // CAPTCHA verified
        async onCaptchaVerify(token) {
            this.captchaToken = token;
            await this.validate();
        },

        // CAPTCHA Expired
        async onCaptchaExpired(data) {
            this.captchaToken = null;
            await this.validate();
        },

        // CAPTCHA Error
        async onCaptchaError(data) {
            this.captchaToken = null;
            await this.validate();
        },

        // Create hCaptcha User
        // CALLED ON REGISTER BUTTON
        // WE NEED AN HCAPTCHA SITE KEY FOR CAPTCHA TO WORK
        // FOR LOCALHOST TESTING, use 127.0.0.1 instead of localhost
        async createHcaptchaUser() {
            // Put form in loading state
            this.loading = true;

            // Validate inputs and captcha solution
            const valid = await this.validate();
            if (!valid) {
                console.log("validate failed!");
                this.loading = false;
                return false;
            }

            // Log analytics
            this.$ga.event({
                eventCategory: "login",
                eventAction: "register",
            });
            // Send off our data!
            try {
                console.log("attempting to register user");
                //const endpoint = 'https://api.bitwave.tv/v1/user/register';
                //const endpoint = 'http://localhost:5001/hark-e2efe/us-central1/api/users/register';
                const endpoint =
                    //"https://us-central1-hark-e2efe.cloudfunctions.net/api/users/register";
                    `${process.env.API_URL}/users/register`;
                const payload = {
                    username: this.user.username,
                    email: this.user.email,
                    password: this.user.password,
                    captcha: this.captchaToken,
                    role: "user",
                    ein: 1,
                    name: "na",
                    phone: 1,
                };

                // Submit to API server
                const result = await this.$axios.$post(endpoint, payload);
                if (result.success) {
                    this.showSuccess(
                        result.message + "\nSigning in to new account..."
                    );
                } else {
                    this.showError(result.message);
                    this.captchaToken = null;
                    this.attempts += 1;
                    this.loading = false;
                    return false;
                }
            } catch (error) {
                console.error(error);
                this.showError(error.message);
                this.captchaToken = null;
                this.attempts += 1;
                this.loading = false;
                return false;
            }

            // Now finally (attempt to) login to our newly created user.
            // In theory this should never fail cuz we just registered
            // our account with the exact same credentials...
            try {
                // Set firebase.auth.Auth.Persistence.SESSION
                await auth.setPersistence("local");
                await auth.signInWithEmailAndPassword(
                    this.user.email,
                    this.user.password
                );
            } catch (error) {
                this.showError(error.message);
                console.log(error.message);
            }

            // Disable loading animation
            this.loading = false;
        },

        // Sign In
        async signIn(email, password) {
            if (!this.$refs.loginForm.validate()) return;

            this.$ga.event({
                eventCategory: "login",
                eventAction: "login",
            });

            this.loading = true;
            try {
                await auth.setPersistence(
                    this.shouldStayLoggedIn ? "local" : "session"
                ); // firebase.auth.Auth.Persistence.SESSION
                await auth.signInWithEmailAndPassword(email, password);
            } catch (error) {
                this.showError(error.message);
                console.log(error.message);
            }
            this.loading = false;
        },

        // Reset Password
        async resetPassword(email) {
            this.$ga.event({
                eventCategory: "login",
                eventAction: "reset password",
            });

            try {
                await auth.sendPasswordResetEmail(email);
                this.showSuccess("Check email for reset link.");
            } catch (error) {
                this.showError(error.message);
            }
        },

        // Validate Data
        async validate() {
            // Validate username & form
            const validUsername = await this.checkUsername(this.user.username);
            // this calls a vuetify v-form validate check
            // If i understand correctly it just checks if the fields are filled out or not -kevin
            const validForm = await this.$refs.loginForm.validate(); 

            console.log(
                `Valid username: ${validUsername}, validForm: ${validForm}`
            );

            // Validate Inputs
            if (!(validUsername && validForm)) {
                console.log("invalid username and form!");
                this.showError("Please fix errors in red");
                return false;
            }

            // Check for captcha
            if (!this.captchaToken) {
                console.log("invalid captcha!");
                this.showError("Please train an AI with the captcha");
                return false;
            }

            // All good
            return true;
        },

        // Check Username
        async checkUsername(username) {
            // default state
            this.usernameError = "";
            this.usernameSuccess = "";

            // Don't check unless we have a username
            if (!username) {
                this.usernameError = "Name is required";
                return false;
            }

            try {
                // all usernames will be valid for now
                const checkUsername = await this.$axios.$get(`${process.env.API_URL}/users/check-username/${username}`);
                if(checkUsername.valid){
                    return true;
                }
                else {
                    return false;
                }

                // Failed to check username
            } catch {
                error;
            }
            {
                console.error(error);
                this.usernameError = error.message;
                return false;
            }
        },

        // Reset Form
        reset() {
            this.$refs.loginForm.reset();
        },

        // Reset form Validation errors
        resetValidation() {
            this.usernameError = "";
            this.usernameSuccess = "";
            this.$refs.loginForm.resetValidation();
            this.hideAlert();
        },

        // Show error alert
        showError(message) {
            this.alertType = "error";
            this.alert = true;
            this.alertMessage = message;
        },

        // Show success alert
        showSuccess(message) {
            this.alertType = "success";
            this.alert = true;
            this.alertMessage = message;
        },

        // Hide alert
        hideAlert() {
            this.alert = false;
        },

        // onAuth handlers
        async authenticated(user) {
            if (user) {
                if (process.client)
                    console.log(
                        `%cLoginDialog.vue:%c Logged in! %o`,
                        "background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;",
                        "",
                        user
                    );
                if (user.displayName)
                    this.showSuccess(
                        `Logged in! Welcome back, ${user.displayName}.`
                    );
                setTimeout(() => this.$emit("close"), 1000);
            } else {
                if (process.client)
                    console.log(
                        `%cLoginDialog.vue:%c Not logged in!`,
                        "background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;",
                        ""
                    );
            }
        },
    },

    mounted() {
        this.unsubAuthChanged = auth.onAuthStateChanged(
            async (user) => await this.authenticated(user)
        );
    },

    beforeDestroy() {
        if (this.unsubAuthChanged) this.unsubAuthChanged();
    },
};
</script>

<style>
    .v-input--checkbox .v-label {
        font-size: 14px;
    }
    h2 {
        font-weight:500;
        font-size: 1em;
    }
    /*font-family: helvetica, arial, sans-serif;*/
</style>
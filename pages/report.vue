<template>
  <v-container
    grid-list-sm
  >
    <v-layout
      row
      justify-space-around
    >
      <v-flex xs12 md8 lg6 xl4>
        <v-card
          class="my-3"
        >
          <v-sheet
            color="white"
            class="d-flex pa-3"
          >
            <v-icon color="red">warning</v-icon>
            <h3 style="font-weight:400" class="pl-3">
              Report Content
            </h3>
          </v-sheet>

          <v-divider></v-divider>

          <v-card-text>
            <v-form ref="report">
              <v-layout column>
                <v-flex>

                  <div class="mb-2">Who are you?</div>
                  <v-text-field
                    class="custom"
                    v-model="name"
                    label="Name"
                    name="name"
                    color="primary"
                    required
                    :rules="[ rules.required ]"
                    :loading="submitting"
                    :disabled="submitting || submitted"
                    validate-on-blur
                    outlined
                  ></v-text-field>

                  <div class="mb-2">If we need to reply, how do we contact you?</div>
                  <v-text-field
                    class="custom"
                    v-model="email"
                    label="Email"
                    name="_replyto"
                    type="email"
                    color="primary"
                    required
                    :rules="[ rules.required, rules.email ]"
                    :loading="submitting"
                    :disabled="submitting || submitted"
                    validate-on-blur
                    outlined
                  ></v-text-field>

                  <div class="mb-2">What are you writing this report about? <b>Who</b> is this report about?</div>
                  <v-text-field
                    class="custom"
                    v-model="subject"
                    label="Streamer URL / Username / Topic"
                    name="subject"
                    type="subject"
                    required
                    :rules="[ rules.required ]"
                    :loading="submitting"
                    :disabled="submitting || submitted"
                    validate-on-blur
                    outlined
                  ></v-text-field>

                  <v-textarea
                    class="custom"
                    v-model="report"
                    name="report"
                    outlined
                    label="Message"
                    color="primary"
                    required
                    :rules="[ rules.required ]"
                    :loading="submitting"
                    :disabled="submitting || submitted"
                    counter
                  ></v-textarea>

                  <!-- HCAPTCHA -->
                  <div
                    class="d-flex mb-4"
                    style="min-height: 75px;"
                  >
                    <v-hcaptcha
                      tabindex="5"
                      :key="attempts"
                      @verify="onCaptchaVerify"
                      @expired=""
                      @error="onCaptchaError"
                    />
                  </div>
                </v-flex>
                <v-btn
                  color="red white--text"
                  :loading="submitting"
                  :disabled="submitting || submitted"
                  @click="createReport"
                >{{ submitted ? 'success' : 'submit' }}</v-btn>
                <v-flex>
                  <v-alert
                    v-show="submitted"
                    :color="success ? 'success' : 'error'"
                    class="mt-4"
                  >{{ success ? `Success: ${reportResult}` : 'Error Occured' }}</v-alert>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>
        </v-card>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    name: 'report',

    data() {
      return {
        name: '',
        email: '',
        subject: '',
        report: '',

        reportResult: '',

        captchaToken: null,
        attempts: 0,

        valid: true,
        submitting: false,
        submitted: false,
        success: true,

        rules: {
          required: value => !!value || 'Required.',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return pattern.test(value) || 'Invalid e-mail.'
          },
        },
      }
    },

    methods: {
      // CAPTCHA verified
      async onCaptchaVerify ( token ) {
        this.captchaToken = token;
        // await this.validate();
      },

      // CAPTCHA Expired
      async onCpatchaExpired ( data ) {
        this.captchaToken = null;
        // await this.validate();
      },

      // CAPTCHA Error
      async onCaptchaError ( data ) {
        this.captchaToken = null;
        // await this.validate();
      },

      async createReport () {
        this.valid = this.$refs.report.validate();

        if (!this.valid) return;

        this.submitting = true;
        this.success = true;

        const endpoint = `${process.env.API_URL}/reports`
        const payload = {
          name: this.name,
          email: this.email,
          subject: this.subject,
          report: this.report,
          captcha: this.captchaToken,
        };

        try {
          const result = await this.$axios.post(
            endpoint,
            payload,
          );
          this.reportResult = result.data;
          console.log( result.data );
        } catch (e) {
          console.log(e);
          this.success = false;
        }

        this.submitting = false;
        this.submitted = true;
      },
    },
  }
</script>

<style scoped>

  .custom.v-text-field input {
    font-size: 1em;
}
  .custom.v-text-field label {
    font-size: 1em;
}
</style>

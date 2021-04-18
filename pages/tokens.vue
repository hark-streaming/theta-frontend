<template>
  <v-container grid-list-md>
    <div class="d-flex justify-space-around align-center">
      <img
        alt="Hark Custom Token"
        src="https://cdn.discordapp.com/attachments/814278920168931382/828515259198865428/hark_custom_token.png"
      />
    </div>
    <v-row class="mt-3">
      <v-col cols="6">
        <v-card class="pa-4">
          <div class="d-flex" align-center fill-height>
            <h2 class="text-right vertical-center">HARK Platform Token</h2>
            <img
              alt="Hark Platform Token Image"
              src="https://cdn.discordapp.com/attachments/814278920168931382/833204067533586452/hark_platform_token_small.png"
              class="center-img"
            />
          </div>
          <p>
            Upon mainnet launch, users will start to gain HARK platform tokens
            through activities on the site and by donating their earned TFuel
            directly to the platform.
          </p>
          <p>
            Every Tfuel transaction on the site will have a small slice pooled
            into the HARK platform token smart contract. Once enough users have
            used the site, a DAO election will take place. Nonprofits with
            enough activity on the platform will be nominated by their users to
            recieve the entire pool.
          </p>
          <p>
            The Hark platform token will act as a governing token for Hark smart
            contracts. While in the future we will allow it to be exported to
            external wallets and have it be tradable on the Theta network, we
            believe that the token itself will hold little value since it is
            meant only to help facilitate the direction of funds to nonprofits.
          </p>
          <p>
            However, future features such as partial nonprofit & partial wallet
            stake nominations can still be developed, meaning that there is room
            for both staking gains in the future.
          </p>
          <p>
            Disclaimer: the HARK Platform Token is not a financial investment,
            do not treat it as such.
          </p>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card class="pa-4">
          <div class="d-flex" align-center fill-height>
            <h2 class="text-right vertical-center">HARK Custom Token</h2>
            <img
              alt="Hark Custom Token Image"
              src="https://media.discordapp.net/attachments/814278920168931382/827009394113642496/custom_token.png"
              class="center-img"
            />
          </div>
          <p>
            Every streamer and nonprofit can apply to have a Hark governance
            token. These tokens will represent loyalty to a streamer or
            nonprofit, similar to channel points, except blockchain based.
          </p>
          <p>
            Hark.tv will start with basic custom token functionality, such as
            blockchain based polls. Our hope is that our development team and
            even external developers can create and deploy other smart contracts
            that interact with the HARK custom tokens for blockchain based
            governance interactions for nonprofit organizations.
          </p>
          <p>
            Essentially, we hope that the Hark custom governance token helps
            bring blockchain governance into the limelight for both streamers
            and nonprofits!
          </p>
          <p>
            At the end of the testnet phase, the testnet platform tokens will be
            reset and converted to claimable mainnet HARK platform tokens.
          </p>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card class="pa-4">
          <div class="d-flex" align-center fill-height>
            <h2 class="text-center width100">Learn More</h2>
          </div>
          <div>
            <p class="text-center width100">
              As we endeavor to create one of the first THETA network based
              tokens, we hope that you'll stay along on the journey.
            </p>
            <p class="text-center width100">
              Please consider signing up to our mailing list.
            </p>
            <!-- Begin Mailchimp Signup Form -->
            <link
              href="//cdn-images.mailchimp.com/embedcode/horizontal-slim-10_7.css"
              rel="stylesheet"
              type="text/css"
            />
            <div id="mc_embed_signup">
              <form
                action="https://hark.us1.list-manage.com/subscribe/post?u=6ba0f2224bceda020087b60d5&amp;id=53c794cce0"
                method="post"
                id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form"
                class="validate"
                target="_blank"
                novalidate
              >
                <div id="mc_embed_signup_scroll">
                  <input
                    type="email"
                    value=""
                    name="EMAIL"
                    class="email"
                    id="mce-EMAIL"
                    placeholder="email address"
                    required
                  />
                  <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                  <div
                    style="position: absolute; left: -5000px"
                    aria-hidden="true"
                  >
                    <input
                      type="text"
                      name="b_6ba0f2224bceda020087b60d5_53c794cce0"
                      tabindex="-1"
                      value=""
                    />
                  </div>
                  <div class="clear">
                    <input
                      type="submit"
                      value="Subscribe"
                      name="subscribe"
                      id="mc-embedded-subscribe"
                      class="button"
                    />
                  </div>
                </div>
              </form>
            </div>
            <!--End mc_embed_signup-->
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
</script>


<style>
.center-img {
  padding: 8px;
  margin: auto;
  width: 50%;
  max-width: 275px;
  max-height: 200px;
}

.vertical-center {
  width: 50%;
  height: 100%;
}

.width100 {
  width: 100%;
}

#mc_embed_signup {
  background: #fff;
  clear: left;
  font: 14px Helvetica, Arial, sans-serif;
  width: 100%;
}
</style>
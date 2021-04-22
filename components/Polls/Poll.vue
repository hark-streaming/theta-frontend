<template>
    <v-container>

        <!-- Display while voting is active -->
        <v-card v-if="!showPollResults" color="neutral">
            <!-- Poll question -->
            <v-sheet color="secondary" class="px-1">
                <h5 :style="{color: 'white'}">{{ this.poll.question }}</h5>
            </v-sheet>

            <!-- Poll answer options with check boxes -->
            <v-list-item
                v-for="(answer) in poll.answers"
                :key="answer.value"
                class="mb-n8"
            >
                <v-checkbox
                    v-model="selected"
                    :label="answer.text"
                    :value="answer.value"
                    @click="checkSelected(answer.value)"
                ></v-checkbox>
            </v-list-item>

            <!-- Submit button -->
            <v-row no-gutters class="justify-center mt-6 pb-2">
                <v-btn color="primary" small @click="addVote()">{{ poll.submitButtonText }}</v-btn>
            </v-row>

        </v-card>

        <!-- Display results of poll -->
        <v-card v-if="showPollResults" color="neutral">
            <!-- Poll question -->
            <v-sheet color="secondary" class="px-1">
                <h5 :style="{color: 'white'}">{{ this.poll.question }}</h5>
            </v-sheet>

            <!-- Chart visual -->
            <div>
                <PollChart :chartdata="chartdata" :options="options" :style="{height: '100%'}" />
            </div>

        </v-card>

    </v-container>

</template>

<script>
import PollChart from "@/components/Polls/PollChart";

export default {

    components: {
        PollChart
    },

    props: {
        /* 
            question: "",                           
            answers: [                              // array containing answer options
                {                                   // object containing data fields for each answer
                    value: 0,                           // answer "value" that doubles as index in array
                    text: "",                           
                    votes: 0                            // total accumulated votes
                }        
            ], 
            showResults: false,                     // if true, automatically skip voting and display results
            multiple: false,                        // enables multiple-choice selection
            submitButtonText: "Submit",             
            customId: 0,                            // poll "id" that doubles as index in array
            active: false                           // if true, poll displayed to public 
        */
        poll: {}, 

        skipVote: false,                            // if true, automatically display results (this instance only)
    }, 

    data() {
        return {
            chartdata: {
                labels: [],
                datasets: [{
                    label: "Votes", 
                    data: [], 
                    borderWidth: 1
                }],
            }, 
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true, 
                            display: false, 
                            stepSize: 1, 
                            suggestedMax: 5, 
                            
                        }, 
                        gridLines: {
                            display: false
                        }
                    }]
                }, 
                responsive: true, 
                animation: false
            }, 

            selected: []            // array of answers that voter has selected (values only)

        }
    }, 

    computed: {
        showPollResults() {
            if (this.skipVote || this.poll.showResults) {
                return true;
            } else {
                return false;
            }
        }
    },

    methods: {

        addVote() {
            this.selected.forEach(x => {    // for each answer in "selected"
                this.$emit("voteAdded", {id: this.poll.customId, val: x});  // emit event with this poll's id and answer's value
                this.chartdata.datasets[0].data[x]++;   // increment chart data's votes (for chart visual purposes only)
            });

            this.skipVote = true;
        }, 

        // if multiple is not true for this poll, maintain selected array at only one answer at a time
        checkSelected(answerVal) {
            if ((!this.poll.multiple && this.selected.length > 1)) {
                var k = 0;
                for (var i = 0; i < this.selected.length; i++) {
                    if (this.selected[i] != answerVal) {
                        k = i;
                    }
                }

                this.selected.splice(k, 1);
            }
        }
        
    }, 

    mounted() {
        // fill in data for chart(s)
        this.poll.answers.forEach(x => {
            if (x.text.length > 7) {
                this.chartdata.labels.push(x.text.substr(0, 7).trim() + "...");
            } else {
                this.chartdata.labels.push(x.text);
            }

            this.chartdata.datasets[0].data.push(x.votes);
        });

        this.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...this.chartdata.datasets[0].data) + 5;

    }
}
</script>

<style scoped>
</style>
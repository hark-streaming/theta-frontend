<template>
    <v-container>

        <!-- Display while voting is active -->
        <v-card v-if="!showPollResults" color="neutral">
            <v-sheet color="secondary" class="px-1">
                <h5 :style="{color: 'white'}">{{ this.poll.question }}</h5>
            </v-sheet>

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

            <v-row no-gutters class="justify-center mt-6 pb-2">
                <v-btn color="primary" small @click="addVote()">{{ poll.submitButtonText }}</v-btn>
            </v-row>

        </v-card>

        <!-- Display results of poll -->
        <v-card v-if="showPollResults" color="neutral">
            <v-sheet color="secondary" class="px-1">
                <h5 :style="{color: 'white'}">{{ this.poll.question }}</h5>
            </v-sheet>

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
            answers: [
                { value: 1, text: "", votes: 0 }
            ], 
            showResults: false, 
            multiple: false, 
            submitButtonText: "Submit", 
            customId: 0
        */
        poll: {}, 

        skipVote: false
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

            selected: []

        }
    }, 

    computed: {
        maximum() {
            // return Math.max(...this.chartdata.datasets[0].data) + 10;
        }, 
        showPollResults() {
            if (!this.skipVote && !this.poll.showResults) {
                return false;
            } else {
                return true;
            }
        }
    },

    methods: {
        addVote() {
            const id = this.poll.customId;
            this.selected.forEach(x => {
                this.poll.answers[x].votes++;
                this.$emit("voteAdded", this.poll);
            });
            this.skipVote = true;
        }, 

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
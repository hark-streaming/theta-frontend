<template>
    <v-container>

        <!-- Display while voting is active -->
        <v-card v-if="!skipVote && !poll.showResults" color="neutral">
            <v-sheet color="secondary" class="px-1">
                <h5 :style="{color: 'white'}">{{ this.poll.question }}</h5>
            </v-sheet>

            <v-list 
                flat
                class="pb-8"
            >
                <v-list-item
                    v-for="(answer) in poll.answers"
                    :key="answer.value"
                    class="mb-n8"
                >
                    <v-checkbox
                        :label="answer.text"
                    ></v-checkbox>
                </v-list-item>
            </v-list>
        </v-card>

        <!-- Display results of poll -->
        <v-card v-if="skipVote || poll.showResults" color="neutral">
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
            submitButtonTest: "Submit", 
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

        }
    }, 

    computed: {
        maximum() {
            // return Math.max(...this.chartdata.datasets[0].data) + 10;
        }
    },

    methods: {
        addVote(answerVal) {
            const id = this.poll.customId;
            this.$emit("voteAdded", {id, answerVal});
        }, 
        
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
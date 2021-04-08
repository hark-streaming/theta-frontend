<template>
    <v-container>

        <!-- Display while voting is active -->
        <v-card v-if="!skipVote && !poll.showResults" color="neutral">
            <h4>{{ this.poll.question }}</h4>
        </v-card>

        <!-- Display results of poll -->
        <v-card v-if="skipVote || poll.showResults" color="neutral">
            <v-sheet color="secondary" class="px-1">
                <h5 :style="{color: 'white'}">{{ this.poll.question }}</h5>
            </v-sheet>

            <div>
                <PollChart :chartdata="chartdata" :options="options" class="small-graph" />
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
                /* labels: ['1', '2'], 
                data: [5, 10] */
                labels: ["123", "456"],
                datasets: [{
                    label: "boom", 
                    data: [1, 2, 3, 4, 5], 
                    borderWidth: 1
                }],
            }, 
            options: {
                scales: {
                    y: {
                        min: 0
                    }
                }
            }
        }
    }, 

    methods: {
        addVote(answerVal) {
            const id = this.poll.customId;
            this.$emit("voteAdded", {id, answerVal});
        }
    }, 
}
</script>

<style scoped>
/* .small-graph {
  width: 250px;
} */
</style>
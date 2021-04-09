

<script>
    import { Bar, mixins } from 'vue-chartjs';

    export default {
        extends: Bar,
        mixins: [mixins.reactiveProp],
        props: {
            chartdata: {
                type: Object, 
                default: null
            }, 
            options: {
                type: Object, 
                default: null
            }
        },
        computed: {
        },
        methods: {
        },
        mounted () {
            setTimeout(() => { this.renderChart(this.chartdata, this.options); }, 500);
            
        }
    }
</script>
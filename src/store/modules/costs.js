import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

let costsDefaultState = () => {
    return {
        allCosts: [],
        costs: [],
        newPushCost: null,
        // newPushCost: {
        //         costId: '123456789000',
        //         year: '2021',
        //         month: '10',
        //         color: '185,155,0',
        //         waterCost: 1200,
        //         eleCost: 1500,
        //         gasCost: 2000,
        //         totalCost: 4700,
        //         addDate: '2021/11/11'
        // }
        chartdata: {
            labels: [],
            datasets: [
                {
                    label: 'water cost',
                    data: [],
                    fill: false,
                    type: 'line',
                    borderColor:'#7fbfff',
                    lineTension: 0.3,
                },
                {
                    label: 'gas cost',
                    data: [],
                    fill: false,
                    type: 'line',
                    borderColor:'#ff7f7f',
                    lineTension: 0.3,
                },
                {
                    label: 'element cost',
                    data: [],
                    fill: false,
                    type: 'line',
                    borderColor:'#ffde59',
                    lineTension: 0.3,
                },
                {
                    label: 'Total cost',
                    backgroundColor:[],
                    borderColor:[],
                    data: [],
                    borderWidth: 1
                },
            ]
        },
    }
}

export default {
    namespaced: true,
    state: costsDefaultState(),
    mutations: {
        reset(state) {
            Object.assign(state, costsDefaultState())
            console.log('store/costsのreset')
        },
        requestCostsMut(state, costs) {
        state.allCosts = costs
        },
        async addCostsMut(state, costs) {
        await state.costs.push(costs)
        console.log(JSON.stringify(state.costs))
        state.newPushCost = costs
        },
        updateCostMut(cost) {
            console.log(cost)
        },
        choiceCostsMut(state, costs) {
            state.costs = costs
        },
        costGraphDataMut(state, graphpushCost) {
            graphpushCost.forEach(cost => {
                state.chartdata.labels.push(cost.month)
                state.chartdata.datasets[0].data.push(cost.waterCost)
                state.chartdata.datasets[1].data.push(cost.gasCost)
                state.chartdata.datasets[2].data.push(cost.eleCost)
                state.chartdata.datasets[3].data.push(cost.totalCost)
                state.chartdata.datasets[3].backgroundColor.push('rgba('+cost.color+',0.2)')
                state.chartdata.datasets[3].borderColor.push('rgba('+cost.color+',1)')                
            });
            // console.log('state.chartdata=> '+state.chartdata)
        }
    },
    actions: {
        //Costsテーブルの中身を全て取得------------------------------------
        requestCosts({ commit }) {
        axios.get('/api/costs')
            .then((res) => {
            commit('requestCostsMut', res.data)
            })
            .catch((e) => alert(e))
        },
        //Login後にuserIdが一致するcostのみ取得 + 順番に並べ替え(年月)---------------------------
        async choiceCosts({ commit, state, dispatch }, userId) {
            //requestCosts--------------------------
            await dispatch('requestCosts')
            console.log(state.allCosts)
            let choice = state.allCosts.filter(cost => cost.userId === userId)
            let sortCost = []
            //データを年月順に並べ替え------------------
            sortCost.push([...choice.sort((a,b)=> (a.year - b.year) || (a.month - b.month ))])
            console.log('store/ChoiceCosts/sortCost=> ' + sortCost)
            commit('choiceCostsMut', choice)
            await dispatch('costGraphData', choice)
        },
        //Costsテーブルのデータを追加-----------------------------------
        addCosts({ commit, dispatch }, costs) {
        axios.post('/api/addCosts', {
                costId: costs.costId,
                year: costs.year,
                month: costs.month,
                color: costs.color,
                waterCost: costs.waterCost,
                eleCost: costs.eleCost,
                gasCost: costs.gasCost,
                totalCost: costs.totalCost,
                addDate: costs.addDate,
                userId: costs.userId,
        }).then((res) => {
            console.log(res)
            commit('addCostsMut', costs)
            dispatch('requestCosts')
        })
        },
        updateCost({ commit }, params) {
            axios.post('/api/updateCost', {
                costId: params.costId,
                year: params.year,
                month: params.month,
                color: params.color,
                waterCost: params.waterCost,
                gasCost: params.gasCost,
                eleCost: params.eleCost,
                totalCost: params.totalCost,
                addDate: params.addDate,
                userId: params.userId,
            }).then((res) => {
                console.log(res)
                commit('updateCostMut', params)
            })

        },
        logout({ commit, dispatch }) {
            commit('reset')
            dispatch('requestCosts')
        },
        //2020年(仮)のみをグラフに入れる
        costGraphData({ commit }, choice) {
            //newCost()-------------------------
            let graphpushCost = []
            choice.forEach(cost => {
                console.log('costGraphData=> '+ cost)
                if (cost.year === '2020') {
                    graphpushCost.push(cost)
                }
            });
            console.log('graphPushCost=> ' + JSON.stringify(graphpushCost))
            commit('costGraphDataMut', graphpushCost)
            // dispatch('labelsPush', graphpushCost)
            // dispatch('waterPush', graphpushCost)
            // dispatch('gasPush', graphpushCost)
            // dispatch('elePush', graphpushCost)
            // dispatch('totalPush', graphpushCost)
            // dispatch('colorPush', graphpushCost)            
        },
        // labelsPush({ commit }, graphpushCost) {
        //     gra
        // }
    },
    getters: {
        getCosts(state) {
        return state.costs;
        },
        // getCosts() {
        //   return [ {
        //         costId: '123456789000',
        //         year: '2021',
        //         month: '10',
        //         color: '185,155,0',
        //         waterCost: 1200,
        //         eleCost: 1500,
        //         gasCost: 2000,
        //         totalCost: 4700,
        //         addDate: '2021/11/11',
        //         userId: '123456789000'
        //   },
        //   {
        //         costId: '123456789100',
        //         year: '2020',
        //         month: '11',
        //         color: '185,0,0',
        //         waterCost: 1000,
        //         eleCost: 1000,
        //         gasCost: 3000,
        //         totalCost: 5000,
        //         addDate: '2021/11/11',
        //         userId: '123456789000'
        //   },
        //   {
        //         costId: '123456789200',
        //         year: '2019',
        //         month: '8',
        //         color: '185,0,0',
        //         waterCost: 1000,
        //         eleCost: 1600,
        //         gasCost: 2000,
        //         totalCost: 5000,
        //         addDate: '2021/11/11',
        //         userId: '123456789000'
        //   },
        //   {
        //         costId: '123456789300',
        //         year: '2020',
        //         month: '9',
        //         color: '185,0,0',
        //         waterCost: 1500,
        //         eleCost: 1000,
        //         gasCost: 2100,
        //         totalCost: 5000,
        //         addDate: '2021/11/11',
        //         userId: '123456789000'
        //   },
        //   {
        //         costId: '123456789110',
        //         year: '2021',
        //         month: '12',
        //         color: '185,120,0',
        //         waterCost: 1800,
        //         eleCost: 1600,
        //         gasCost: 2000,
        //         totalCost: 5400,
        //       addDate: '2021/11/11',
        //         userId: '123456789000'
        //   }]
        // },
        getNewPushCost(state) {
        return state.newPushCost;
        },
        // getNewPushCost() {
        //     return  {
        //         costId: '123456789000',
        //         year: '2021',
        //         month: '10',
        //         color: '185,155,0',
        //         waterCost: 1200,
        //         eleCost: 1500,
        //         gasCost: 2000,
        //         totalCost: 4700,
        //         addDate: '2021/11/11',
        //   }
        // }
    }
}
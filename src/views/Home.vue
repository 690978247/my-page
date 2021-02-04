<template>
  <div class="home">
    <div class="home-head">
      <div class="head-content">
        <p class="">换色次数：<span>{{changeColors}}</span></p>
        <p>当前颜色批次：<span>{{LastColor}}</span></p>
        <p>任务号：<span>{{ID}}</span></p>
      </div>
      <div class="head-btns" >
        <!-- <el-input class="btn-input" ></el-input>
        <el-button v-model="invalue" >开始入库</el-button>
        <el-input class="btn-input" ></el-input>
        <el-button v-model="outvalue" >开始出库</el-button> -->
        <el-button @click="stopTimer" >{{ type? '暂 停': '恢 复' }}</el-button>
        <el-button @click="clearData" >{{ clear? '清 空': '继 续' }}</el-button>
        <el-button @click="quickCount" >快速计算</el-button>
      </div>
    </div>
    <div class="wrap" >
      <div class="box">
        <div class="box-item item-first">
          <h3 class="title-h3">PBS</h3>
          <base-table :tableHead="tableHead" :tableData="firstData"  ></base-table>
        </div>
        <div class="box-item item-second">
          <h3 class="title-h3">工艺流程</h3>
          <p >电泳生产线</p>
          <i class="el-icon-bottom"></i>
          <p>烘干室</p>
          <i class="el-icon-bottom"></i>
          <p>强冷室</p>
          <i class="el-icon-bottom"></i>
          <p>喷漆室</p>
          <i class="el-icon-bottom"></i>
          <p>...</p>
        </div>
        <div class="box-item item-three">
          <h3 class="title-h3">漆前库-任务池</h3>
          <base-table :tableHead="tableHead.filter(f => f.prop !== 'outNum')" :tableData="threeData" ></base-table>
        </div>
        <div class="box-item item-four">
          <h3 class="title-h3">漆前库-库存</h3>
          <base-table :tableHead="tableHead.filter(f => f.prop !== 'outNum')" :tableData="fourData" ></base-table>
        </div>
      </div>
      <div class="content">
        <div class="content-item content-five">
          <h3 class="title-h3">总装要车顺序</h3>
          <base-table :baseTableHeight="tableHeight" :rowClassName="fiveRowClassName" :tableHead="tableHead" :tableData="fiveData" ></base-table>
        </div>
        <div class="content-item content-six">
          <h3 class="title-h3">焊装发车顺序</h3>
          <base-table :baseTableHeight="tableHeight" :rowClassName="sixRowClassName" :tableHead="tableHead.filter(f => f.prop !== 'outNum')" :tableData="sixData" ></base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseTable from '../components/baseTable'
import data from '../../data'
import $ from 'jquery'

export default {
  name: 'Home',
  components: { baseTable },
  data() {
    return {
      tableHeight: 380,
      interval: null,
      invalue: '',
      outvalue: '',
      type: true,
      clear: true,
      processHead: [
        {
          prop: 'process',
          label: '工艺'
        }
      ],
      tableHead: [
        {
          prop: 'planOut',
          label: '计划出库顺序'
        },
        {
          prop: 'num',
          label: '数量'
        },
        {
          prop: 'color',
          label: '颜色码'
        },
        {
          prop: 'outNum',
          label: '实际出库顺序'
        },
      ],
      firstData: [],
      secondData: [],
      threeData: [],
      fourData: [],
      fiveData: data.data_out,
      sixData: data.data_in,
      inventoryInterval: null,
      tasksInterval: null,
      PBSInterval: null,
      currentSix: [],
      currentFirst: [],
      firstList: [],
      sixList: [],
      time: 1000,
      inputVal: 40, //漆前库初始数量
      LastColor: '', //上车颜色
      changeColors: 0,
      ID: 0, //当前任务号
      index: 0,
      clearTimer: null,
    }
  },
  watch: {
    firstData (val) {
      this.currentFirst = val.map((item, index) => {
        return item.planOut
      })
      this.firstList = this.firstList.concat(this.currentFirst) //数组合并
      this.firstList = [...new Set(this.firstList)] //数组去重
    },
    // fourData: {
    //   handler: function(val, oldVal) {
    //     let list = []
    //   list = val.map((item, index) => {
    //     return item.planOut
    //   })
    //   this.sixList = this.sixList.concat(list) //数组合并
    //   this.sixList = [...new Set(this.sixList)] //数组去重
    //   },
    //   immediate: true
    // },
    fourData (val) {
      this.currentSix = val.map((item, index) => {
        return item.planOut
      })
      this.sixList = this.sixList.concat(this.currentSix) //数组合并
      this.sixList = [...new Set(this.sixList)] //数组去重
    },
  },
  created() {
    var $this = this
    this.fourData = this.fiveData.slice(0, this.inputVal)
    this.sixList = this.fourData.map((item, index) => {
        return item.planOut
    })
    // this.threeData = this.fourData.splice(0, 10)
    this.threeData = JSON.parse(JSON.stringify(this.GetDataToCommandPool(this.fourData))).flat(Infinity)  //数组扁平化处理
    this.fourData.splice(0, this.inputVal)
    this.timerList()
    
  },
  methods: {
    timerList () {
      var $this = this
        this.inventoryInterval = setInterval(() => {
        $this.fourData.push($this.sixData[$this.inputVal + this.index])
        if ($this.threeData.length === 0) {
          $this.threeData = JSON.parse(JSON.stringify($this.GetDataToCommandPool($this.fourData))).flat(Infinity)
        }
        // $this.threeData.push($this.fourData[0])
        // $this.fourData.splice(0, 1)
        $this.index++
      }, $this.time)

      this.tasksInterval = setInterval(() => {
        $this.threeData[0].outNum = $this.ID
        $this.fiveData.forEach((item,index) => {
          if (item.planOut === $this.threeData[0].planOut) {
            $this.fiveData[index].outNum = $this.ID
          }
        })
        $this.firstData.push($this.threeData[0])
        $this.ID++
        if ($this.LastColor !== $this.threeData[0].color) {
          $this.changeColors++
        }
        $this.LastColor = $this.threeData[0].color
        $this.threeData.splice(0, 1)
      }, $this.time)

      this.PBSInterval = setInterval(() => {
        $this.firstData.splice(0, 5)
      }, 5000)
    },
    stopTimer () {
      var $this = this
      this.type = !this.type
      if (!this.type) {
        clearInterval(this.inventoryInterval)
        clearInterval(this.tasksInterval)
        clearInterval(this.PBSInterval)
      } else {
        this.timerList()
      }
    },
    clearData () {
      var $this = this
      if (this.clear) {
        $this.clear = !$this.clear
        this.clearTimer = setInterval(() => {
          if ($this.threeData.length === 0) {
            // $this.clear = !$this.clear
            clearInterval(this.inventoryInterval)
            clearInterval(this.tasksInterval)
            clearInterval(this.PBSInterval)
            clearInterval(this.clearTimer)
          }
        }, 1000)
      } else {
        $this.clear = !$this.clear
        clearInterval(this.inventoryInterval)
        clearInterval(this.tasksInterval)
        clearInterval(this.PBSInterval)
        clearInterval(this.clearTimer)
        this.timerList()
      }
    },
    fiveRowClassName({row, rowIndex}){
      if (this.currentFirst.includes(row.planOut)) {
        return 'in-row'
      }
      if (this.firstList.includes(row.planOut)) {
        return 'out-row'
      }
    },
    sixRowClassName({row, rowIndex}){
      if (this.currentSix.includes(row.planOut)) {
        return 'in-row'
      }
      if (this.sixList.includes(row.planOut)) {
        return 'out-row'
      }
    },
    quickCount () {
      this.time = 0
    },

    // 算法部分
       
    // 确认任务池数据为空 输入漆前库内的相关对象数组，返回应该投入到任务池中的对象数据
    // GetDataToCommandPool(data_qiqian) {
    //   console.log(this.ID)
    //   console.log(this.LastColor)
    //     var min_planOut
    //     var min_color
    //     //1 判断上车颜色 是否与库存内的最小任务号相同
    //     if (data_qiqian.length > 0) {

    //         var temp_li = data_qiqian.sort((b, c) => (b.planOut - c.planOut))
    //         min_planOut = temp_li[0].planOut
    //         min_color = temp_li[0].color

    //         // 1.1相同   计算非当前颜色的最小顺序号，最大喷漆组数量
    //         if (min_color == this.LastColor) {

    //             var min2_data = filiterisNotColor(data_qiqian, min_color).sort((b, c) => (b.planOut - c.planOut))
    //             //的最小顺序号
    //             var min2_planOut = min2_data[0].planOut
    //             // 判断该颜色数量  是否小于 第二小顺序号的最大喷漆组数量
    //             if (this.ID + filiterColor(data_qiqian, min_color).length < min2_planOut + 50) {
    //                 return filiterColor(data_qiqian, min_color)
    //             }
    //             else {
    //               //不做处理 继续执行

    //           }
    //         }
    //         // 取所有组根据当前任务号加上对应颜色的漆前库库存数量，排除影响其他颜色出库顺序颜色
    //         return data_qiqian
    //     }
    // },

    // //筛选出库颜色
    // filiterColor(data, itemcolor) {
    //   return data_qiqian.filter(item => item.color == itemcolor)
    // },

    // //排除出库颜色
    // filiterisNotColor(data, itemcolor) {
    //   return data_qiqian.filter(item => item.color == itemcolor)
    // },
    // //颜色分组
    // filiterComputeGroupByColor(data) {
    // //var tempcolor = "" 
    // //var return_list 
    // //while ()
    // }
    GetDataToCommandPool(data_qiqian) {
            var min_planOut
            var min_color 
            //1 判断上车颜色 是否与库存内的最小任务号相同
            if (data_qiqian.length > 0) {
                 
                var temp_li = data_qiqian.sort((b, c) => (b.planOut - c.planOut))
                min_planOut = temp_li[0].planOut
                min_color = temp_li[0].color 

                // 1.1相同   计算非当前颜色的最小顺序号，最大喷漆组数量
                if (min_color == this.LastColor) {

                    var min2_data = this.filiterisNotColor(data_qiqian, min_color).sort((b, c) => (b.planOut - c.planOut))
                    //的最小顺序号
                    var min2_planOut = min2_data[0].planOut
                    // 判断该颜色数量  是否小于 第二小顺序号的最大喷漆组数量
                    if (this.ID + this.filiterColor(data_qiqian, min_color).length < min2_planOut + 50) {
                        return this.filiterColor(data_qiqian, min_color)
                    }
                    else {
                        //不做处理 继续执行

                    }
                }

                // 所有组  取当前任务号根据加上对应颜色的漆前库库存数量，排除影响其他颜色出库顺序颜色
                var GroupData = this.filiterComputeGroupByColor(data_qiqian);

                //排除影响出库的颜色分组()
                var excludeResult =  this.excludeGroup(GroupData);

                //如果筛选结果不为空的话，从筛选结果中取
                if (excludeResult) {
                    //优先选择与上次喷漆色相同的
                    if (this.filiterColor(excludeResult, this.LastColor).length > 1) {
                        return this.filiterColor(excludeResult, this.LastColor);
                    }
                    else {
                        //暂时返回最小顺序的
                        return this.filiterColor(excludeResult, min_color);
                    }
                }
                else {
                    return this.filiterColor(data_qiqian, min_color);

                }

            }
    },
     //选取前N条进行出库



    //排除影响出库的颜色分组() 
    excludeGroup(data ,color) {

        ////递归移除
        //data.forEach((item, index, arr) => {
        //    if (item.color === "宇宙蓝金属漆") {
        //        data.splice(index, 1)
        //    }
        //});
        //return data;
        var del_li 
        $.each(data, function (i, item) {
            var result = true;
            console.log(i);
            console.log(item.color);
            $.each(data, function (j, item1) {
                // 当前任务号加本颜色的数量，若大于其中一个其他颜色的最小出库顺序号+50的情况视为影响出库
                if (i != j) {
                    //if ((item1.MinPlanOut + 50) < (ID + item.num)) {
                    if ((item.color == color)) { 
                        result = false;
                    }
                }
            });
            item.result = result;
        });
        data = data.filter(item => item.result == true)
        return data;
    },

        //筛选出库颜色
    filiterColor(data, itemcolor) {
        return data.filter(item => item.color == itemcolor)
    },


    //排除出库颜色
    filiterisNotColor(data, itemcolor) {
        return data.filter(item => item.color == itemcolor)
    },

    //选出该数据的前N条



    //颜色分组 
    filiterComputeGroupByColor(data) {
        var sorted = this.groupBy(data, function (item) {
            return [item.color];//按照color进行分组
        });
        $.each(sorted, function (i, item) {
            item.color = item[0].color
            item.MinPlanOut = item[0].planOut
            item.num = item.length
        });
        return sorted
    },

    groupBy(array, f) {
        const groups = {};
        array.forEach(function (o) { //注意这里必须是forEach 大写
            const group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(function (group) {
            return groups[group];
        });
    }
          
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  padding: 12px;
  background: #D5E1F7;
  box-sizing: border-box;
}
.home-head {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  .head-content {
    width: 630px;
    display: flex;
    p {
      flex: 1;
      color: #0078D7;
    }
    p:nth-child(2) {
      flex: 2;
    }
  }
}
.head-btns {
  width: 100%;
  text-align: right;
  .btn-input {
    width: 180px;
    margin:0 10px;
  }
}
.wrap {
  width: 100%;
  height: calc(100% - 50px);
  
}
.box {
  height: 390px;
  margin-bottom: 15px;
  display: flex;
  .box-item {
    padding: 15px;
    background: #fff;
    min-width: 350px;
    min-height: 360px;
    overflow: auto;
  }
  .item-second {
    min-width: 150px;
  }
  .box-item:not(:last-child){
    margin-right: 15px;
  }
  .item-first {
    flex: 2.5;
  }
  .item-second {
    flex: 1;
    text-align: center;
    p {
      font-size: 14px;
    }
    i {
      font-size: 24px;
      padding: 10px 0;
    }
  }
  .item-three{
    flex: 2.5;
  }
  .item-four{
    flex: 2.5;
  }
}
.content {
  height: calc(100% - 390px - 15px);
  display: flex;
  .content-item {
    padding: 15px;
    background: #fff;
    min-width: 300px;
    min-height: 390px;
    overflow: auto;
  }
  .content-item:not(:last-child){
    margin-right: 15px;
  }
  .content-five{
    flex: 1;
  }
  .content-six{
    flex: 1;
  }
}

.title-h3 {
  margin-top: 5px;
  margin-bottom: 15px;
}
</style>

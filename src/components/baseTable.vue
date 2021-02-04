<template>
  <div class="baseTable">
    <el-table  
      border
      :height="baseTableHeight"
      class="table-auto-height"
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      highlight-current-row
      :row-class-name="rowClassName"
      @selection-change="handleSelectionChange">
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="110">
        </el-table-column>
        <el-table-column
          v-for="item in tableHead"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :show-overflow-tooltip="true">
          
          <template slot-scope="scope">
              <slot :name="item.prop" :scope="scope">
                <span>{{scope.row[item.prop]}}</span>
              </slot>
            </template>
        </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    baseTableHeight: {
      type: Number,
      default: 315
    },
    // 是否显示表格勾选框
    showSelection: {
      type: Boolean,
      default () {
        return false
      }
    },
    rowClassName: {
      type: Function,
      default () {
        return {}
      }
    },
    // 操作内容 1 添加 2删除
    rowBtns: {
      type: Array,
      default () {
        return []
      }
    },
    // 表头
    tableHead: {
      type: Array,
      default () {
        return []
      }
    },
    // loading: {
    //   type: Boolean,
    //   default: false
    // },
    tableData: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
    }
  },
  methods: {
    handleSelectionChange(val){
      this.$emit('selectionChange', val)
    },
    editFun(val) {
      this.$emit('editFun', val)
    },
    deleteFun(val) {
      this.$emit('deleteFun',val)
    }
  }
}
</script>

<style lang="scss" scoped>
  .table_remove,.table_edit{
    width:60px;
    height:30px;
    background:rgba(255,255,255,1);
    border:2px solid rgba(228,228,228,1);
    border-radius:15px;
    position: relative;
    display: inline-block;
    margin-left:8px;
    cursor: pointer;
  }
</style>
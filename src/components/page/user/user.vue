<template>
    <div class="user">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 用户管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box">
            <el-button type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
            <el-select v-model="select_cate" placeholder="筛选管理员" class="handle-select mr10">
                <el-option key="1" label="管理员" value="1"></el-option>
                <el-option key="2" label="非管理员" value="0"></el-option>
            </el-select>
            <el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
            <el-button type="primary" icon="el-icon-refresh" @click="reset">重置</el-button>
        </div>
        <el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="registerTime" label="注册日期" sortable width="160" :formatter="timeFormat">
            </el-table-column>
            <el-table-column prop="nickname" label="昵称">
            </el-table-column>
            <el-table-column prop="username" label="username">
            </el-table-column>
            <el-table-column prop="_id" label="_id">
            </el-table-column>
            <el-table-column prop="isManager" label="管理员" :formatter="managerFormat" width="70">
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="small" v-if="scope.row.isManager === '1'" type="danger"
                               @click="handleManager(scope.$index, scope.row, '0')">取消管理权限</el-button>
                    <el-button size="small" v-if="scope.row.isManager === '0'" type="primary"
                               @click="handleManager(scope.$index, scope.row, '1')">添加管理权限</el-button>
                    <el-button size="small" type="danger"
                               @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                @current-change ="handleCurrentChange"
                :page-size="pageCount"
                layout="total, prev, pager, next"
                :total="total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import { fetch } from 'src/config/fetch';
    import utils from 'src/config/utils';

    export default {
        name: "user",
        data() {
            return {
                url: './static/vuetable.json',
                tableData: [],
                cur_page: 1,
                pageCount: 10,
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                del_list: [],
                is_search: false,
                total: 0
            }
        },
        created(){
            this.getData();
        },
        computed: {
            data(){
                const self = this;
                return self.tableData.filter(function(d){
                    let is_del = false;
                    for (let i = 0; i < self.del_list.length; i++) {
                        if(d.name === self.del_list[i].name){
                            is_del = true;
                            break;
                        }
                    }
                    if(!is_del){
                        if(d.isManager.indexOf(self.select_cate) > -1 &&
                            (d.username.indexOf(self.select_word) > -1 ||
                                d.nickname.indexOf(self.select_word) > -1)
                        ){
                            return d;
                        }
                    }
                })
                // return this.tableData;
            }
        },
        methods: {
            // 分页
            handleCurrentChange(val){
                this.cur_page = val;
                this.getData();
            },
            async getData(){
                /*let self = this;
                if(process.env.NODE_ENV === 'development'){
                    self.url = '/ms/table/list';
                };
                self.$axios.post(self.url, {page:self.cur_page}).then((res) => {
                    self.tableData = res.data.list;
                });*/
                let res = await fetch('post', 'getUsers', {page: 1, pageCount: 10});
                console.log(res);
                if (res.total > 0) {
                    this.tableData = res.data;
                } else {
                    this.tableData = [];
                }
                this.total = res.total;

            },
            search(){
                this.is_search = true;
            },
            reset() {
                // 充值搜索选项
                this.select_cate = '';
                this.select_word = '';
                this.del_list = [];
                this.is_search = false;
            },
            formatter(row, column) {
                return row.address;
            },
            timeFormat(row, column) {
                let time = utils.formatTime('Y-m-d H:i:s', (new Date(row.registerTime).getTime())/1000);
                return time;
            },
            managerFormat(row, column) {
                let isManager = row.isManager;
                if (isManager === '1') {
                    return '是';
                } else {
                    return '否';
                }
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            // 设置用户权限
            async handleManager(index, row, type) {
                let res = await fetch('post', 'userManager', {username: row.username, isManager: type});
                if (res.code === 0) {
                    this.$message({message: '设置管理员权限成功', type: 'success'});
                    row.isManager = type;
                } else if (res.code === 1008) {
                    this.$message(res.msg);
                } else {
                    this.$message({message: res.mas, type: 'error'});
                }
            },
            handleDelete(index, row) {
                this.$message.error('删除第'+(index+1)+'行');
            },
            delAll(){
                return;
                const self = this,
                    length = self.multipleSelection.length;
                let str = '';
                self.del_list = self.del_list.concat(self.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += self.multipleSelection[i].name + ' ';
                }
                self.$message.error('删除了'+str);
                self.multipleSelection = [];
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            }
        }
    }
</script>

<style scoped>
    .handle-box{
        margin-bottom: 20px;
    }
    .handle-select{
        width: 120px;
    }
    .handle-input{
        width: 300px;
        display: inline-block;
    }
</style>

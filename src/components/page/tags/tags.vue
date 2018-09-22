<template>
    <div class="user">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 分类管理</el-breadcrumb-item>
                <el-breadcrumb-item>分类列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box">
            <el-button type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
            <el-select v-model="select_cate" placeholder="分类展示/收起" class="handle-select mr10">
                <el-option key="1" label="展示" value="1"></el-option>
                <el-option key="2" label="收起" value="0"></el-option>
            </el-select>
            <el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
            <el-button type="primary" icon="el-icon-refresh" @click="reset">重置</el-button>
            <el-button type="primary" icon="el-icon-plus" @click="dialogFormVisible = true">新增分类</el-button>
        </div>
        <el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="classid" label="分类ID">
            </el-table-column>
            <el-table-column prop="classname" label="分类名称">
            </el-table-column>
            <el-table-column prop="showclass" label="默认展示" :formatter="tagShowFormat">
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="small" type="primary"
                               @click="tagsEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button size="small" type="danger"
                               @click="tagsDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 弹出模态框 -->
        <el-dialog title="添加分类" :visible.sync="dialogFormVisible" width="40%">
            <el-form :model="form">
                <el-form-item label="分类ID" label-width="100px">
                    <el-input v-model="form.classid" placeholder="两位以上的整数" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分类名称" label-width="100px">
                    <el-input v-model="form.classname" placeholder="尽量精简，两个字" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分类标识" label-width="100px">
                    <el-input v-model="form.classpath" placeholder="英文标识" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否默认显示" label-width="100px">
                    <el-switch v-model="form.delivery"></el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addTag" :loading="loading">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 修改弹出模态框 -->
        <el-dialog title="修改分类" :visible.sync="dialogEdit" width="40%">
            <el-form :model="editForm">
                <el-form-item label="分类ID" label-width="100px">
                    <el-input v-model="editForm.classid" disabled placeholder="两位以上的整数" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分类名称" label-width="100px">
                    <el-input v-model="editForm.classname" placeholder="尽量精简，两个字" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分类标识" label-width="100px">
                    <el-input v-model="editForm.classpath" disabled placeholder="英文标识" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否默认显示" label-width="100px">
                    <el-switch v-model="editForm.delivery"></el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogEdit = false">取 消</el-button>
                <el-button type="primary" @click="editTag" :loading="editLoading">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { fetch } from 'src/config/fetch';
    import { setCache } from 'src/config/cache';
    import utils from 'src/config/utils';

    export default {
        name: "tags",
        data() {
            return {
                url: './static/vuetable.json',
                tableData: [],
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                del_list: [],
                is_search: false,
                dialogFormVisible: false,
                form: {
                    delivery: false,
                    classid: '',
                    classname: '',
                    classpath: ''
                },
                loading: false,
                dialogEdit: false,
                editLoading: false,
                editForm: {}
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
                        if(d.showclass.indexOf(self.select_cate) > -1 &&
                            (d.classname.indexOf(self.select_word) > -1 ||
                                d.classid.indexOf(self.select_word) > -1)
                        ){
                            return d;
                        }
                    }
                })
                // return this.tableData;
            }
        },
        methods: {
            async getData(){
                /*let self = this;
                if(process.env.NODE_ENV === 'development'){
                    self.url = '/ms/table/list';
                };
                self.$axios.post(self.url, {page:self.cur_page}).then((res) => {
                    self.tableData = res.data.list;
                });*/
                let res = await fetch('post', 'getTagsList');
                console.log(res);
                if (res.code === 0) {
                    this.tableData = res.data;
                    setCache('TagsLists', res.data);
                } else {
                    this.tableData = [];
                }
                // this.total = res.total;


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
            async addTag() {
                let params = {
                    classid: this.form.classid,
                    classname: this.form.classname,
                    classpath: this.form.classpath,
                    showclass: this.form.delivery ? '1' : '0'
                };
                this.loading = true;
                let res = await fetch('post', 'addNewsTags', params);
                this.loading = false;
                this.dialogFormVisible = false;
                if (res.code === 0) {
                    console.log(res);
                    this.$message({
                        message: `成功新增${params.classname}分类`,
                        type: 'success'
                    });
                    this.getData();
                } else if (res.code === 1001) {
                    this.$message({
                        message: res.msg,
                        type: 'warning'
                    });
                } else {
                    this.$message({
                        message: res.msg,
                        type: 'error'
                    });
                }
            },
            tagShowFormat(row, column) {
                let showclass = row.showclass;
                if (showclass === '1') {
                    return '是';
                } else {
                    return '否';
                }
            },
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
            async tagsDelete(index, row) {
                this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async() => {

                    let res = await fetch('post', 'deleteTags', {classid: row.classid});
                    if (res.code === 0) {
                        this.$message({message: '删除分类成功！', type: 'success'});
                        this.getData();
                    } else {
                        this.$message({message: res.mas, type: 'error'});
                    }

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });

            },
            tagsEdit(index, row) {
                // this.$message.error('编辑第'+(index+1)+'行');
                this.editForm = {
                    delivery: row.showclass === '1',
                    classid: row.classid,
                    classname: row.classname,
                    classpath: row.classpath
                };
                this.dialogEdit = true;
            },
            async editTag() {
                this.editLoading = true;
                let params = {
                    classid: this.editForm.classid,
                    classname: this.editForm.classname,
                    showclass: this.editForm.delivery ? '1' : '0'
                };
                let res = await fetch('post', 'editNewsTags', params);
                this.editLoading = false;
                this.dialogEdit = false;
                this.editForm = {};
                if (res.code === 0) {
                    this.$message({message: '修改分类成功！', type: 'success'});
                    this.getData();
                } else if (res.code === 1008) {
                    this.$message({message: res.msg, type: 'info'});
                } else {
                    this.$message({message: res.msg, type: 'error'});
                }
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

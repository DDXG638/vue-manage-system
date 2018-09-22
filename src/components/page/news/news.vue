<template>
    <div class="user">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 新闻管理</el-breadcrumb-item>
                <el-breadcrumb-item>新闻列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box">
            <el-button type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
            <el-select v-model="currClassId" placeholder="新闻分类" class="handle-select mr10">
                <el-option v-for="(item, index) in tagsLists" :key="item.classid" :label="item.classname" :value="item.classid"></el-option>
                <!--<el-option key="2" label="热点" value="11"></el-option>-->
            </el-select>
            <el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
            <el-button type="primary" icon="el-icon-refresh" @click="reset">重置</el-button>
            <el-button type="primary" icon="el-icon-plus" @click="">添加新闻</el-button>
        </div>
        <el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="新闻ID" width="180">
            </el-table-column>
            <el-table-column prop="_id" label="_id">
            </el-table-column>
            <el-table-column prop="befrom" label="新闻来源" width="120">
            </el-table-column>
            <el-table-column prop="title" label="新闻标题">
            </el-table-column>
            <el-table-column prop="time" label="发布时间" width="150">
            </el-table-column>
            <el-table-column label="操作" width="280">
                <template slot-scope="scope">
                    <router-link :to="`editDetail/${scope.row.id}`">
                        <el-button size="small" type="primary">编辑</el-button>
                    </router-link>
                    <el-button size="small" type="danger"
                               @click="newsDelete(scope.$index, scope.row)">删除</el-button>
                    <el-button size="small" type="primary"
                               @click="newsDetail(scope.$index, scope.row)">详情</el-button>
                    <el-button size="small" type="primary"
                               @click="newsShare(scope.$index, scope.row)">分享</el-button>
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

        <!-- 弹出模态框 -->
        <el-dialog title="新闻详情" :visible.sync="dialogFormVisible" width="40%">
            <el-card class="box-card">
                <div slot="header" >
                    <span>{{newsDetailItem.title}}</span>
                </div>
                <div class="detailItem" v-html="newsDetailItem.detail">
                </div>
            </el-card>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { fetch, baseUrl } from 'src/config/fetch';
    import utils from 'src/config/utils';
    import { setCache, getCache } from 'src/config/cache';
    export default {
        name: "news",
        data() {
            return {
                tableData: [],
                cur_page: 1,
                pageCount: 10,
                total: 0,
                currClassId: '10',
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
                newsDetailItem: {
                    title: '',
                    detail: ''
                },
                tagsLists: []
            }
        },
        created(){
            this.getData();
            this.getTagsList();
        },
        computed: {
            data(){
                const self = this;
                // console.log(self.tableData);
                return self.tableData.filter(function(d){
                    if (!d.befrom) {
                        d.befrom = '-';
                    }
                    let is_del = false;
                    for (let i = 0; i < self.del_list.length; i++) {
                        if(d.id === self.del_list[i].id){
                            is_del = true;
                            break;
                        }
                    }
                    if(!is_del){
                        if(d.befrom.indexOf(self.select_word) > -1 || d.title.indexOf(self.select_word) > -1){
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
                let params = {
                    classid: this.currClassId,
                    page: this.cur_page,
                    count: this.pageCount
                };
                let res = await fetch('post', 'getNewsLists', params);
                // console.log(res);
                if (res.code === 0) {
                    this.tableData = res.data;
                } else {
                    this.tableData = [];
                }
                this.total = res.total;
                // this.tableData = [];

            },
            async getTagsList() {
                let result = getCache('TagsLists');
                if (result && result.length > 0) {
                    this.tagsLists = JSON.parse(result);
                    // console.log(result);
                } else {
                    let res = await fetch('post', 'getTagsList');
                    // console.log('获取的', res);
                    if (res.code === 0) {
                        this.tagsLists = res.data;
                        setCache('TagsLists', res.data);
                    } else {
                        this.tagsLists = [];
                    }
                }
            },
            search(){
                this.is_search = true;
                this.cur_page = 1;
                this.getData();
            },
            reset() {
                // 充值搜索选项
                // this.select_cate = '';
                this.select_word = '';
                this.del_list = [];
                this.is_search = false;
            },
            // 分页
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            async newsDelete(index, row) {

                this.$confirm('此操作将永久删除该条新闻, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async() => {

                    let params = {
                        id: row.id
                    };
                    let res = await fetch('post', 'removeNews', params);
                    if (res.code === 0) {
                        this.$message({message: '删除新闻成功！', type: 'success'});
                        this.getData();
                    } else {
                        this.$message({message: res.mag, type: 'error'});
                    }

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });

                // this.$message.error('删除第'+(index+1)+'行');
            },
            newsDetail(index, row) {

                this.newsDetailItem= {
                    title: row.title,
                    detail: row.newstext
                }
                this.dialogFormVisible = true;
                // this.$message.error('详情第'+(index+1)+'行');
            },
            newsShare(index, row) {
                let shareUrl = baseUrl + '/appPage/detailShare/' + row._id;
                this.$alert(shareUrl, '新闻分享链接', {
                    confirmButtonText: '确定',
                    type: 'success'
                });
            },
            tagsEdit(index, row) {
                this.$message.error('编辑第'+(index+1)+'行');
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

<style lang="stylus">
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
    .el-message-box {
        width: 580px;
    }
    .box-card {
        width: 100%;
        .detailItem {
            max-height: 400px;
            overflow-y: scroll;
            text-indent: inherit !important;
            font-size: inherit;
            img {
                width: 100% !important;
                height: auto !important;
            }
            img[type="icon"]{
                width: initial!important;
            }
            *{
                text-indent: inherit !important;
                font-size: inherit !important;
                font-family: inherit !important;
                line-height: inherit !important;
                text-align: justify !important;
                text-justify: inter-ideograph !important;
            }
            div,p{
                width: 100% !important;
                padding-bottom: 15px;
            }
        }
    }
</style>

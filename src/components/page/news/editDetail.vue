<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-date"></i> 新闻管理</el-breadcrumb-item>
                <el-breadcrumb-item>编辑新闻</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-form ref="formData" :model="formData" label-width="80px">
            <el-form-item label="新闻分类">
                <el-select v-model="formData.classid" placeholder="请选择新闻分类">
                    <el-option v-for="(item, index) in tagsLists" :key="item.classid" :label="item.classname" :value="item.classid"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="新闻标题">
                <el-input v-model="formData.title"></el-input>
            </el-form-item>
            <el-form-item label="新闻媒体">
                <el-input v-model="formData.befrom"></el-input>
            </el-form-item>

        </el-form>

        <quill-editor ref="myQuillEditor" v-model="formData.newstext" :config="editorOption"></quill-editor>
        <!-- 文件上传input 将它隐藏-->
        <el-upload class="upload-demo" :action="qnLocation" :before-upload='beforeUpload' :data="uploadData" :on-success='upScuccess'
                   ref="upload" style="display:none">
            <el-button size="small" type="primary" id="imgInput" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="插入中,请稍候">
                点击上传
            </el-button>
        </el-upload>

        <el-button class="editor-btn" type="primary" :loading="submitLoading" @click="submit">提交</el-button>
    </div>
</template>

<script>
    import { quillEditor } from 'vue-quill-editor';
    import { fetch } from 'src/config/fetch';
    import { setCache, getCache } from 'src/config/cache';
    import * as Quill from 'quill'    // 引入编辑器

    const STATICDOMAIN = 'http://p6iiiwy0l.bkt.clouddn.com/'; // 图片服务器的域名，展示时使用
    const STATVIDEO = 'http://otq0t8ph7.bkt.clouddn.com/';

    export default {
        data() {
            return {
                editorOption: {
                    // something config
                },
                formData: {
                    id: '',
                    classid: '',
                    title: '',
                    befrom: '',
                    newstext: '<p>请输入新闻主题内容</p>',
                    titlepic: '',
                    titlepic2: '',
                    titlepic3: '',
                    ptitlepic: ''
                },
                tagsLists: [],
                submitLoading: false,
                uploadData: {},
                photoUrl: '',         // 上传图片地址
                uploadType: '',    // 上传的文件类型（图片、视频）
                fullscreenLoading: false,
                addRange: [],
                dialogImageUrl: '',
                dialogVisible: false,
                picArr: []
            }
        },
        components: {
            quillEditor
        },
        created(){
            this.getTagsList();
        },
        // 页面加载后执行 为编辑器的图片图标和视频图标绑定点击事件
        async mounted() {
            // 获取id
            let id = this.$route.params.id;
            console.log(id);
            if (id && id.length > 0) {
                let newsDetail = await fetch('post', 'getNewsDetail', {id});
                if (newsDetail.code === 0) {
                    let {
                        classid,
                        title,
                        befrom,
                        newstext,
                        titlepic,
                        titlepic2,
                        titlepic3,
                        ptitlepic
                    } = newsDetail.data;
                    this.formData = {
                        id,
                        classid,
                        title,
                        befrom,
                        newstext,
                        titlepic,
                        titlepic2,
                        titlepic3,
                        ptitlepic
                    }
                } else {
                    this.$message({
                        type: 'error',
                        message: newsDetail.msg
                    });
                }

            }
            // 为图片ICON绑定事件  getModule 为编辑器的内部属性
            this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('image', this.imgHandler);
            this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('video', this.videoHandler); // 为视频ICON绑定事件
        },
        methods: {
            onEditorChange({ editor, html, text }) {
                console.log(html);
                this.formData.newstext = html;
            },
            // 图片上传之前调取的函数,这个钩子还支持 promise.上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。
            beforeUpload (file) {
                return this.qnUpload(file);
            },
            // 文件上传成功时的钩子  function(response, file, fileList)
            upScuccess (e, file, fileList) {
                console.log(e);
                this.fullscreenLoading = false;
                let vm = this;
                let url = '';
                //if (this.uploadType === 'image') { // 获得文件上传后的URL地址
                url = STATICDOMAIN + e.key;
                // } else if (this.uploadType === 'video') {
                //     url = STATVIDEO + e.key;
                // }
                if (url != null && url.length > 0) { // 将文件上传后的URL地址插入到编辑器文本中
                    let value = url;
                    // API: https://segmentfault.com/q/1010000008951906
                    // this.$refs.myTextEditor.quillEditor.getSelection();
                    // 获取光标位置对象，里面有两个属性，一个是index 还有 一个length，这里要用range.index，即当前光标之前的内容长度，然后再利用 insertEmbed(length, 'image', imageUrl)，插入图片即可。
                    vm.addRange = vm.$refs.myQuillEditor.quill.getSelection();
                    value = value.indexOf('http') !== -1 ? value : 'http:' + value;
                    vm.$refs.myQuillEditor.quill.insertEmbed(vm.addRange !== null ? vm.addRange.index : 0, vm.uploadType, value, Quill.sources.USER); // 调用编辑器的 insertEmbed 方法，插入URL
                    this.picArr.push(url);
                } else {
                    this.$message.error(`${vm.uploadType}插入失败`);
                }
                this.$refs['upload'].clearFiles(); // 插入成功后清除input的内容
            },
            // 七牛上传文件
            async qnUpload (file) {
                this.fullscreenLoading = true;
                const suffix = file.name.split('.'); // 分割文件名
                // 获取文件的后缀名称“.png”
                const ext = suffix.splice(suffix.length - 1, 1)[0];
                console.log(this.uploadType);
                //if (this.uploadType === 'image') { // 如果是点击插入图片
                // 像后天获取key 和 token
                let res = await fetch("post", "getQiNiuToken");
                if (res.code === 0) {
                    this.uploadData = {
                        key: `image/${suffix.join('.')}_${new Date().getTime()}.${ext}`,
                        token: res.data
                    }
                } else {
                    this.fullscreenLoading = false;
                    this.$message({
                        type: 'error',
                        message: '获取七牛token失败，无法上传图片！'
                    });
                }
                // return this.$http('common/get_qiniu_token').then(res => {
                //     this.uploadData = {
                //         key: `image/${suffix.join('.')}_${new Date().getTime()}.${ext}`,
                //         token: res.data
                //     }
                // })
                // } else if (this.uploadType === 'video') { // 如果是点击插入视频
                //     return this.$http('common/get_qiniu_token').then(res => {
                //         this.uploadData = {
                //             key: `video/${suffix.join('.')}_${new Date().getTime()}.${ext}`,
                //             token: res
                //         }
                //     })
                // }
            },
            // 点击图片ICON触发事件
            imgHandler(state) {
                this.addRange = this.$refs.myQuillEditor.quill.getSelection();
                console.log(state);
                if (state) {
                    let fileInput = document.getElementById('imgInput');
                    fileInput.click(); // 加一个触发事件
                    console.log('触发点击事件');
                }
                this.uploadType = 'image';
            },
            // 点击视频ICON触发事件
            videoHandler(state) {
                this.addRange = this.$refs.myQuillEditor.quill.getSelection();
                if (state) {
                    let fileInput = document.getElementById('imgInput');
                    fileInput.click() // 加一个触发事件
                }
                this.uploadType = 'video';
            },
            async submit(){
                // console.log(this.formData.newstext);
                // this.$message.success('提交成功！');
                this.submitLoading = true;
                if (this.picArr.length > 2) {
                    this.formData.titlepic = this.formData.titlepic || this.picArr[0];
                    this.formData.titlepic2 = this.formData.titlepic2 || this.picArr[1];
                    this.formData.titlepic3 = this.formData.titlepic3 || this.picArr[2];
                } else if (this.picArr.length > 0){
                    this.formData.ptitlepic = this.formData.ptitlepic || this.picArr[0];
                }
                let res = await fetch('post', 'editNewsDetail', this.formData);
                this.submitLoading = false;
                // console.log(this.formData);
                if (res.code === 0) {
                    this.$message.success('编辑新闻成功！');
                    this.reset();
                } else {
                    this.$message.error(res.msg);
                }
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
            reset() {
                this.formData= {
                    classid: '',
                    title: '',
                    befrom: '',
                    newstext: '<p>请输入新闻主题内容</p>',
                    titlepic: '',
                    titlepic2: '',
                    titlepic3: '',
                    ptitlepic: ''
                }
            }
        },
        computed: {
            editor() {
                return this.$refs.myQuillEditor.quillEditor;
            },
            // 获取当前的页面的http协议
            qnLocation: () => {
                return location.protocol === 'http:' ? 'http://upload.qiniu.com' : 'https://up.qbox.me'
            }
        }
    }
</script>
<style scoped>
    .editor-btn{
        margin-top: 20px;
    }
</style>

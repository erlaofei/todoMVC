(function (window) {
	//1.模拟数据渲染页面
	var v = new Vue({
		el: '#app',
		data: {
			//初始化dataList
			dataList: JSON.parse(window.localStorage.getItem('dataList')) || [],
			name: '',
			//定义用来保存更新前数据
			oldUpdate: {},
			//筛选默认选中
			selected: 0,
			//控制li隐藏显示的数组
			liLis: [],
			acNum: 0
		},

		methods: {
			//添加数据
			addTodo() {
				if (this.name.trim() === '') return
				//先排序获取数组中最大的id
				this.dataList.sort((a, b) => { return a.id - b.id })
				this.dataList.push({ id: this.dataList.length ? this.dataList.sort((a, b) => a.id - b.id)[this.dataList.length - 1]['id'] + 1 : 1, content: this.name, isFinish: false })
				this.name = ''
			},
			//根据索引删除数据
			delTodo(index) {
				if (window.confirm('确定删除么？')) {
					this.dataList.splice(index, 1)
				}
			},
			//删除所有选中的数据
			delAll() {
				//因为有侦听事件，只要过滤掉要删除的数据即可
				this.dataList = this.dataList.filter(item => {
					return item.isFinish == false
				})
			},
			//根据索引修改数据
			editTodo(index) {
				//对比新旧内容是否一致
				if (this.oldUpdate.content.trim() === this.dataList[index].content.trim()) return this.$refs.show[index].classList.remove('editing')
				if (this.dataList[index].content.trim() === '') {
					//如果内容为空则删除这条数据
					return this.delTodo(index)
				}
				//其实已经修改完毕直接移除样式
				return this.$refs.show[index].classList.remove('editing')

			},
			//让编辑框显示排它操作
			showEdit(index) {
				//拿到Vue中所有的ref对象移除editing样式editing
				this.$refs.show.forEach(element => {
					element.classList.remove('editing')
				});
				this.$refs.show[index].classList.add('editing')
				//将修改之前的数据赋值给data中的oldUpdate 利用JSON来实现深度拷贝(不包含function)
				this.oldUpdate = JSON.parse(JSON.stringify(this.dataList[index]))
			},
			ifhash() {
				switch (window.location.hash) {
					case '':
					case '#/':
						this.selected = 1
						this.dataList.forEach((item, i) => {
							this.liLis[i] = true
						})
						break
					case '#/active':
						this.selected = 2

						this.dataList.forEach((item, i) => {
							this.liLis[i] = item.isFinish
						})
						if (this.liLis.every(item => {
							return item == false
						})) {
							window.location.hash = ''
						}
						break
					case '#/completed':
						this.selected = 3
						this.dataList.forEach((item, i) => {
							this.liLis[i] = !item.isFinish
						})
						//如果当前选项中没有数据跳转到all页面
						if (this.liLis.every(item => {
							return item == false
						})) {
							console.log(123)
							window.location.hash = ''
						}
						break

				}
			},


		},
		watch: {
			//发现每次修改数组都需要同步数据，并且需要设置深度监听,默认是false 监听dataList数据变化同步到localStorage 
			dataList: {
				handler(newArr) {
					this.liLis = []
					this.ifhash()
					//如果数组中全部为true 改变全选按钮状态
					// if (!newArr.some(item => {
					// 	return !item.isFinish
					// })
					// ) {
					// 	this.allCheck = true
					// }

					// //如果数组中全部为false 
					// if (newArr.every(item => {
					// 	return !item.isFinish
					// })) {
					// 	this.allCheck = false
					// }  有bug  不好用 还是用计算属性吧
					window.localStorage.setItem('dataList', JSON.stringify(newArr))
				},
				deep: true
			}
		},
		//计算属性
		computed: {
			//通过计算属性来计算是否需要选中全选按钮
			showAll: {
				get() {
					return this.dataList.every(item => {
						return item.isFinish
					})
				},
				set(val) {
					//计算属性没有办法直接修改掉计算后的数据，可以通过修改data中的数据来实现set效果
					this.dataList.forEach(item => {
						item.isFinish = val
					})
				}
			},
			checkNum() {
				return this.dataList.filter(item => {
					return item.isFinish
				}).length
			}
		},
		//钩子函数
		created() {
			this.ifhash()
		},
		//页面加载完成
		mounted() {

			window.onhashchange = () => {
				this.ifhash()
			}


		},
		//自定义指令：
		directives: {
			focus: {
				//指令定义
				inserted: function (el) {
					el.focus()
				}
			}
		}

	})

})(window);

$(function () {
	ele = $('#scorebook');
	if (ele.length > 0) {
		React.render(React.createElement(EC.Scorebook), ele[0]);




	}
});

EC.Scorebook = React.createClass({
	mixins: [EC.TableFilterMixin],

	getInitialState: function () {
		return {
			units: [],
			classrooms: [],
			defaultUnit: 'All Units',
			defaultClassroom: 'All Classrooms',
			selectedClassroom: null,
			selectedUnit: null,
			currentPage: 1,
			loading: true
		}
	},

	componentDidMount: function () {
		this.fetchData();
		that = this;
		$(window).scroll(function (e) {
			x = $('#page-content-wrapper').height()

			console.log('x', x)
			if (($(window).scrollTop() + document.body.clientHeight) > ($('#page-content-wrapper').height()/2) ) {
				console.log('hit bottom')
				if (!that.state.loading) {
					that.loadMore();
				}
			}
		});
	},
	loadMore: function () {
		this.state.loading = true
		this.setState({currentPage: this.state.currentPage + 1})
		this.fetchData();
	},
	fetchData: function () { 
		$.ajax({
			url: 'scores',
			data: {
				current_page: this.state.currentPage,
				classroom_id: this.state.selectedClassroom,
				unit_id: this.state.selectedUnit
			},
			success: this.displayData,
			error: function () {
			}
		})
	},

	displayData: function (data) {
		this.setState({
			classroomFilters: this.getFilterOptions(data.classrooms, 'name', 'id', 'All Classrooms'),
			unitFilters: this.getFilterOptions(data.units, 'name', 'id', 'All Units'),
		});
		if (this.state.currentPage == 1) {
			this.setState({scores: data.scores});
		} else {
			var x1 = _.last(_.keys(this.state.scores))			
			var new_scores = this.state.scores
			_.forEach(data.scores, function (val, key) {
				if (key == x1) {
					new_scores[key]['results'] = (new_scores[key]['results']).concat(val['results'])
				} else {
					new_scores[key] = val
				}
			})
			this.setState({scores: new_scores})
		}
		this.setState({loading: false})
	},

	selectUnit: function (id) {
		this.setState({currentPage: 1, selectedUnit: id})
		this.fetchData();

	},

	selectClassroom: function (id) {
		this.setState({currentPage: 1, selectedClassroom: id})
		this.fetchData();
	},

	render: function() {
		scores = _.map(this.state.scores, function (data, student_id) {
			return <EC.StudentScores data={data} />
		});
		return (
			<span>

				<div className="tab-subnavigation-wrapper">
	                <div className="container">
	                  <ul>
	                    <li><a href="" className="active">Student View</a></li>
	                  </ul>
	                </div>
	            </div>
	            <div className="container">
		            <section className="section-content-wrapper">
				            <EC.ScorebookFilters
				            	defaultClassroom = {this.state.defaultClassroom}
				            	classroomFilters = {this.state.classroomFilters}
				            	selectClassroom={this.selectClassroom}

				            	defaultUnit= {this.state.defaultUnit}
				            	unitFilters = {this.state.unitFilters}
				            	selectUnit={this.selectUnit} />

				            <EC.ScorebookLegend />
			        </section>
		        </div>


		        {scores}

			</span>
		);
	}


});
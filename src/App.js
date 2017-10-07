import React from 'react';
import SideBar from './SideBar';
import Content from './Content';

class App extends React.Component {
  state = {
    /* временное решение для получения id студента */
    sid: window.location.search.substr(5),
    userData: {},
    hints: [],
    services: [],
    rubsales: [],
    procsales: [],
    offices: [],
    permsale: {},
    labels: {},
    fetchingData: false,
    fetchingDataError: false,
    fetchingDataErrorText: null
  }

  componentDidMount () {
  	this.getData(this.state.sid);
  }

  getData = (sid) => {
    this.setState({ fetchingData: true });
    const body = JSON.stringify({sid: sid});
    fetch('/invoice/get-data', 
    {
      method: 'POST',
      accept: 'application/json',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      let r = response.json();
      throw new Error(r.message);
    })
    .then(json => {
      this.setState({
        fetchingData: false,
        userData: json.userData ? json.userData : {},
        hints: json.hints ? json.hints : [],
        services: json.services ? json.services : [],
        rubsales: json.rubsales ? json.rubsales : [],
        procsales: json.procsales ? json.procsales : [],
        offices: json.offices ? json.offices : [],
        permsale: json.permsale ? json.permsale : {},
        labels: json.labels ? json.labels : {}
      });
    })
    .catch(err => {
      this.setState({
        fetchingDataError: true,
        fetchingDataErrorText: err.message,
        fetchingData: false
      });
    })
  }

  render () {
    return (
   	  <div className="col-sm-12">
        { this.state.fetchingData ?
          <div className="alert alert-warning"><b>Подождите.</b> Загружаем данные для формы...</div> :
            this.state.fetchingDataError ?
              <div className="alert alert-danger"><b>Ошибка!</b> Не удалось загрузить данные!</div> :
              <div className="row row-offcanvas row-offcanvas-left invoice-create">
                <SideBar
                  user={ this.state.userData }
                  hints={ this.state.hints } />
                <Content
                  sid={ this.state.sid }
                  services={ this.state.services }
                  rubsales={ this.state.rubsales }
                  procsales={ this.state.procsales }
                  offices={ this.state.offices }
                  permsale={ this.state.permsale }
                  labels={ this.state.labels }
                />
              </div>
        }
      </div>
    );
  } 
}

export default App;

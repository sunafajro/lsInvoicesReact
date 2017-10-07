import React from 'react';
import PropTypes from 'prop-types';
import UserBlock from './UserBlock';

class SideBar extends React.Component {
  render () {
  	return (
      <div id="sidebar" className="col-xs-6 col-sm-2 sidebar-offcanvas">
		    <UserBlock user={ this.props.user } />
		    { this.props.hints.length ?
		      <ul>
          { this.props.hints.map((item, i) => {
              return (<li key={ 'hint_' + i }>{ item }</li>);
            })}
          </ul> : ''}
	    </div>
  	);
  }
}

SideBar.propTypes = {  
  user: PropTypes.object.isRequired,
  hints: PropTypes.array.isRequired,
}

export default SideBar;

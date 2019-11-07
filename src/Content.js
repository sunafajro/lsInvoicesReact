import React from 'react';
import PropTypes from 'prop-types';

class Content extends React.Component {
  state= {
    serviceId: '0',
    procsaleId: '0',
    permsaleId: '0',
    rubsaleId: '0',
    rubsaleValue: 0,
    officeId: '0',
    lessonNum: 0,
    remain: false,
    totalSum: 0,
    totalSumWithSale: 0,
    totalSale: 0,
    validation: {
      service: null,
      num: null,
      office: null
    },
    sending: false,
    saveResult: null
  }

  /**
   * считает полную стоимость счета и скидку
   * а так же сбрасывает состояние валидации полей
   * и состояние результата запроса создания счета
   */
  calcInvoiceSum = () => {
    let totalValue = 0;
    let totalWithSale = 0;
    let totalSale = 0;
    let serviceVal = this.state.serviceId !== '0' ? this.getServiceValue(this.state.serviceId) : null;
    let procSaleVal = this.state.procsaleId !== '0' ? this.getProcSaleValue(this.state.procsaleId) : null;
    let rubSaleVal = this.state.rubsaleId !== '0' ? this.getRubSaleValue(this.state.rubsaleId) : null;

    /* считаем полную стоимость без скидок */
    totalValue = this.state.lessonNum * serviceVal;
    totalWithSale = totalValue;
    
    if (rubSaleVal) {
      /* вычитаем рублевую назначенную скидку */
      totalWithSale = totalWithSale - rubSaleVal;
    } else if (this.state.rubsaleValue) {
      /* или вычитаем рублевую введеную скидку */
      totalWithSale = totalWithSale - this.state.rubsaleValue;
    }

    if (procSaleVal) {
      /* вычитаем процентную назначенную скидку */
      totalWithSale = totalWithSale - (totalWithSale * procSaleVal * 0.01);
    } else if (this.state.permsaleId !== '0') {
      /* вычитаем процентную постоянную скидку */
      totalWithSale = totalWithSale - (totalWithSale * this.props.permsale.value * 0.01);
    }

    /* получаем размер скидки и округляем в большую сторону */
    if (totalWithSale === 0) {
      totalSale = totalValue - totalWithSale;
    } else {
      totalSale = Math.round(totalValue - totalWithSale);
    }

    return {
      totalSum: totalValue,
      totalSumWithSale: totalValue - totalSale,
      totalSale: totalSale
    };
  }

  /**
   * возвращает стоимость услуги по идентификатору
   * @param {sting} id 
   * @return {number}
   */
  getServiceValue = (id) => {
    let value;

    this.props.services.forEach(item => {
      if (item.id === id) {
        value = parseFloat(item.value).toFixed(2);
      } 
    });

    return value;
  }

  /**
   * возвращает стоимость процентной скидки по идентификатору
   * @param {sting} id 
   * @return {number}
   */
  getProcSaleValue = (id) => {
    let value;

    this.props.procsales.forEach(item => {
      if (item.id === id) {
        value = parseFloat(item.value).toFixed(2);
      } 
    });

    return value;
  }

  /**
   * возвращает стоимость рублевой скидки по идентификатору
   * @param {sting} id 
   * @return {number}
   */
  getRubSaleValue = (id) => {
    let value;

    this.props.rubsales.forEach(item => {
      if (item.id === id) {
        value = parseFloat(item.value).toFixed(2);
      } 
    });

    return value;
  }

  /**
   * проверяет поля на заполнение
   * @return {boolean} 
   */
  validateForm = () => {
    let valid = true;
    let validation = { ...this.state.validation };

    if (this.state.serviceId === '0') {
      valid = false;
      validation.service = false;
    } else {
      validation.service = true;      
    }

    if (this.state.lessonNum === 0) {
      valid = false;
      validation.num = false;
    } else {
      validation.num = true;      
    }

    if (this.props.offices.length && this.state.officeId === '0') {
      valid = false;
      validation.office = false;
    } else {
      validation.office = true;      
    }

    this.setState({ validation });

    return valid;
  }

  /**
   * отправляет данные формы на сервер
   */
  handleSendForm = () => {
    if (this.validateForm()) {
      const { totalSum, totalSumWithSale, totalSale } = this.calcInvoiceSum();
      const validation = this.resetValidation();

      this.setState({
        sending: true,
        totalSum,
        totalSumWithSale,
        totalSale,
        validation, 
        saveResult: null
      });

      const body = JSON.stringify({
        Invoicestud: {
          sid: this.props.sid,
          service: this.state.serviceId,
          procsale: this.state.procsaleId,
          rubsaleid: this.state.rubsaleId,
          rubsalesval: this.state.rubsaleValue,
          permsale: this.state.permsaleId,
          num: this.state.lessonNum,
          office: this.state.officeId,
          remain: this.state.remain ? '1' : '0',
          invoiceValue: totalSumWithSale,
          invoiceDiscount: totalSale
        }
      });
      fetch('/invoice/create',
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
          this.setState({
            sending: false,
            saveResult: true
          });
          let timer = setTimeout(() => { window.location.replace('/studname/view?id=' + this.props.sid) }, 2000);
        } else {
          throw new Error('error');  
        }        
      })
      .catch(err => {
        this.setState({
          sending: false,
          saveResult: false
        });
      });
    }
  }

  /**
   * обрабатывает нажатие кнопки Рассчитать
   */
  handleButtonClick = () => {
    const { totalSum, totalSumWithSale, totalSale } = this.calcInvoiceSum();
    const validation = this.resetValidation();

    this.setState({
      totalSum,
      totalSumWithSale,
      totalSale,
      validation, 
      saveResult: null
    });
  }

  /**
   * сбрасывает состояние валидации
   * @return {object}
   */
  resetValidation = () => {
    let validation = { ...this.state.validation };
    
    validation.service = null;
    validation.num = null;
    validation.office = null;

    return validation;
  }

  render () {
    return (
      <div id="content" className="col-sm-6">
        <p className="pull-left visible-xs">
          <button type="button" className="btn btn-primary btn-xs" data-toggle="offcanvas">Toggle nav</button>
        </p>
        { this.state.sending ? 
            <div className="alert alert-warning">{ this.props.labels.sendingMessage }</div> :
              this.state.saveResult === null ?
                <div className="alert alert-info">{ this.props.labels.total }: { this.state.totalSum } р. { this.state.totalSale < 0 ? '+' : '-' } { Math.abs(this.state.totalSale) } р. = { this.state.totalSumWithSale} р.</div> :
                  this.state.saveResult !== true ?
                    <div className="alert alert-danger">{ this.props.labels.saveErrorMessage }</div> :
                      <div className="alert alert-success">{ this.props.labels.saveSuccessMessage }</div> }
        <div>
          { this.props.services.length ?
            <div className={ 
              this.state.validation.service === null ? 'form-group' : 
                this.state.validation.service !== true ? 'form-group has-error' : 
                  'form-group has-success' }>
              <label className="control-label" htmlFor="invoicestud-calc_service">{ this.props.labels.service }:</label>
              <select
                id="invoicestud-calc_service"
                className="form-control"
                name="Invoicestud[calc_service]"
                value={ this.state.serviceId }
                onChange={ (e) => this.setState({ serviceId: e.target.value }) }
              ><option value='0'>{ this.props.labels.select}</option>
                { this.props.services.map(item => {
                    return (<option key={'service_' + item.id} value={ item.id }>#{ item.id } { item.name } ({ item.value } р.)</option>);
                }) }          
              </select>
            </div> : '' }
          <div className="row">  
            { this.props.procsales.length ?
              <div className={ this.props.permsale.id ? 'col-sm-6' : 'col-sm-12' }>
                <div className="form-group">
                  <label className="control-label" htmlFor="invoicestud-calc_salestud_proc">{ this.props.labels.procsale }:</label>
                    <select
                      id="invoicestud-calc_salestud_proc"
                      className="form-control"
                      name="Invoicestud[calc_salestud_proc]"
                      value={ this.state.procsaleId }
                      onChange={ (e) => this.setState({
                        procsaleId: e.target.value,
                        permsaleId: '0'
                      })}
                      disabled={ this.state.permsaleId !== '0' ? true : false }
                    ><option value='0'>{ this.props.labels.select }</option>
                      { this.props.procsales.map(item => {
                          return (<option key={'procsale_' + item.id} value={ item.id }>{ item.name }</option>);
                      })}          
                    </select>
                </div>
              </div> : '' }
              { this.props.permsale.id ?
              <div className={ this.props.procsales.length ? 'col-sm-6' : 'col-sm-12' }>
                <div className="form-group">
                  <label className="control-label" htmlFor="invoicestud-calc_permsale">{ this.props.labels.permsale }:</label>
                  <select
                    id="invoicestud-calc_permsale"
                    className="form-control"
                    name="Invoicestud[calc_permsale]"
                    value={ this.state.permsaleId }
                    onChange={ (e) => this.setState({
                      permsaleId: e.target.value,
                      procsaleId: '0'
                    })}
                    disabled={ this.state.procsaleId !== '0' ? true : false }
                  >
                    <option value='0'>{ this.props.labels.select }</option>
                    <option value={this.props.permsale.id }>{ this.props.permsale.name }</option>
                  </select>
                </div>
              </div> : '' }
          </div>
          <div className="row">
            { this.props.rubsales.length ?  
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="control-label" htmlFor="invoicestud-calc_salestud_id">{ this.props.labels.rubsaleid }:</label>
                  <select
                    id="invoicestud-calc_salestud_id"
                    className="form-control"
                    name="Invoicestud[calc_salestud_id]"
                    value={ this.state.rubsaleId }
                    onChange={(e) => this.setState({
                      rubsaleId: e.target.value,
                      rubsaleValue: 0
                    })}
                    disabled={ this.state.rubsaleValue !== 0 ? true : false }
                  ><option value='0'>{ this.props.labels.select }</option>
                    { this.props.rubsales.map(item => {
                      return (<option key={'rubsale_' + item.id} value={ item.id }>{ item.name }</option>);
                    })}          
                  </select>
                </div>
              </div> : '' }
              <div className={ this.props.rubsales.length ? 'col-sm-6' : 'col-sm-12'}>
                <div className="form-group">
                  <label className="control-label" htmlFor="invoicestud-calc_salestud_val">{ this.props.labels.rubsaleval }:</label>
                  <input
                    id="invoicestud-calc_salestud_inp"
                    className="form-control"
                    name="Invoicestud[calc_salestud_value]"
                    value={ this.state.rubsaleValue }
                    onChange={(e) => this.setState({
                      rubsaleValue: !isNaN(parseFloat(e.target.value)) ? parseFloat(e.target.value) : 0,
                      rubsaleId: '0'
                    })}
                    disabled={ this.state.rubsaleId !== '0' ? true : false }
                  />
                </div>
              </div>
            </div>
          <div className={
            this.state.validation.num === null ? 'form-group' : 
              this.state.validation.num !== true ? 'form-group has-error' : 
                'form-group has-success' }>
            <label className="control-label" htmlFor="invoicestud-num">{ this.props.labels.num }:</label>
            <input
              id="invoicestud-num"
              className="form-control"
              name="Invoicestud[num]"
              value={ this.state.lessonNum }
              onChange={ (e) => this.setState({ lessonNum: parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0 }) }
            />
          </div>
          { this.props.offices.length ?
            <div className={
              this.state.validation.office === null ? 'form-group' : 
                this.state.validation.office !== true ? 'form-group has-error' :
                  'form-group has-success' }>
              <label className="control-label" htmlFor="invoicestud-calc_office">{ this.props.labels.office }:</label>
              <select
                id="invoicestud-calc_office"
                className="form-control"
                name="Invoicestud[calc_office]"
                value={ this.state.officeId }
                onChange={ (e) => this.setState({ officeId: e.target.value }) }
              ><option value='0'>{ this.props.labels.select }</option>
                { this.props.offices.map(item => {
                    return (<option key={'office_' + item.id} value={ item.id }>{ item.name }</option>);
                })}          
              </select>
            </div> : '' }
          <div className="form-group clearfix">
            <div className="pull-left">
            <button
              style={{ marginRight: '5px'}}
              className="btn btn-primary"
              onClick={ () => this.handleButtonClick() }
            >{ this.props.labels.calculate }</button>
            <button
              style={{ marginRight: '5px'}}
              className="btn btn-success"
              onClick={ () => this.handleSendForm() }
            >{ this.props.labels.addsale }</button>
            </div>
            <div className="pull-right">
              <label>
                <input
                  type="checkbox"
                  name="Invoicestud[remain]"
                  onChange={ (e) => this.setState({ remain: e.target.checked }) } /> { this.props.labels.remain }
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Content.propTypes = {
  sid: PropTypes.string.isRequired,
  services: PropTypes.array.isRequired,
  rubsales: PropTypes.array.isRequired,
  procsales: PropTypes.array.isRequired,
  offices: PropTypes.array.isRequired,
  permsale: PropTypes.object.isRequired,
  labels: PropTypes.object.isRequired,
}

export default Content;
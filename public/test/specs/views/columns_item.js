define([
  'sinon',
  'backbone',
  'handlebars',
  'facade',
  'config',
  'views/columns_item',
  'text!templates/columns.handlebars'
], function(sinon, Backbone, Handlebars, fc, Config, ColumnsItemView, TPL) {

  'use strict';

  var expect = chai.expect;

  describe('Columns_item view', function() {

    before(function() {
      this.$el = $('<div></div>');

      this.collection = new (Backbone.Collection.extend({}))();
      this.renderSpy = sinon.spy(ColumnsItemView.prototype, 'render');
      this.view = new ColumnsItemView({
        el: this.$el,
        collection: this.collection,
        options: {
          name:  'x',
          label: 'x Axis'
        }
      });
      this.template = Handlebars.compile(TPL);
    });

    it('should be instance of ColumnsItemView', function() {
      expect(this.view).to.be.instanceof(ColumnsItemView);
    });

    it('should initialize with an empty template', function() {
      expect(this.$el).to.have.html('');
    });

    it('should throw an error when not instantiated with a name and a label', function() {
      var call = _.bind(function() {
        new ColumnsItemView({
          el: this.$el,
          collection: this.collection
        });
      }, this);
      expect(call).to.throw(Error);
    });

    it('should not have an error state on initialization', function() {
      expect(this.view.hasError).to.equal(false);
      expect(this.view.errorMessage).to.equal(undefined);
    });

    describe('_getOption', function() {

      it('should return false when option doesn\'t exist', function() {
        var res = this.view._getOption('test');
        expect(res).to.equal(false);
      });

      it('should return the option when exists', function() {
        var expected = this.collection.add({ name: 'test' }).attributes;
        var res = this.view._getOption('test');
        expect(res).to.equal(expected);
        this.collection.reset();
      });

    });

    describe('_displayError', function() {

      before(function() {
        ColumnsItemView.prototype.render.restore();
        this.renderSpy = sinon.spy(ColumnsItemView.prototype, 'render');
      });

      beforeEach(function() {
        fc.set('graph', 'scatter');
      });

      it('should not render or activate the error state when called with false', function() {
        var call = function() {
          this.view._displayError(false);
        };
        expect(this.view.hasError).to.equal(false);
        expect(this.view.errorMessage).to.equal(undefined);
        expect(this.renderSpy).to.not.have.been.called;
      });

      it('should update the error state when called with an error message', function() {
        this.view._displayError('test');
        expect(this.view.hasError).to.equal(true);
        expect(this.view.errorMessage).to.equal('test');
      });

      it('should unset the facade\'s column\'s value and trigger \'route:update\' when called with an error message', function() {
        var spy = sinon.spy();
        Backbone.Events.on('route:update', spy);
        fc.set('x', 'test'); // x is the name of the column used during the instantiation
        this.view._displayError('test');
        expect(fc.get('x')).to.equal(undefined);
        expect(spy).to.have.been.called;
      });

      it('should render the error message when called with it', function() {
        var errorMessage = 'I should be rendered';
        this.view._displayError(errorMessage);
        expect(this.$el.find('p').text()).to.equal(errorMessage);
      });

      afterEach(function() {
        fc.unset('graph');
        this.view._displayError(false);
        this.$el.html();
      });

    });

    describe('restoreOption', function() {

      beforeEach(function() {
        this._displayErrorSpy = sinon.spy(ColumnsItemView.prototype, 'restoreOption');
        fc.set('graph', 'scatter')
      });

      it('should call _displayError and set hasRestoredValue to false when option is not found', function() {
        fc.set('x', 'test');
        this.view.restoreOption();
        expect(this._displayErrorSpy).to.have.been.called;
        expect(this.view.hasRestoredValue).to.equal(false);
      });

      it('should call _displayError and set hasRestoredValue to false when the option isn\'t compatible with the chart\'s type', function() {
        fc.set('x', 'test');
        this.collection.add({ name: 'test', type: 'Bla bla bla' });
        this.view.restoreOption();
        expect(this._displayErrorSpy).to.have.been.called;
        expect(this.view.hasRestoredValue).to.equal(false);
      });

      it('should call _displayError and set hasRestoredValue to false when the option has been already picked', function() {
        fc.set('x', 'test');
        this.collection.add({ name: 'test', type: 'number', disabled: true });
        this.view.restoreOption();
        expect(this._displayErrorSpy).to.have.been.called;
        expect(this.view.hasRestoredValue).to.equal(false);
      });

      it('should call setValue and set hasRestoredValue to true when everything\'s ok', function() {
        fc.set('x', 'test');
        this.collection.add({ name: 'test', type: 'number', disabled: false });
        var spy = sinon.spy(ColumnsItemView.prototype, 'setValue');
        this.view.restoreOption();
        expect(spy).to.have.been.calledWith('test');
        expect(this.view.hasRestoredValue).to.equal(true);
        ColumnsItemView.prototype.setValue.restore();
      });

      afterEach(function() {
        fc.unset('graph');
        ColumnsItemView.prototype.restoreOption.restore();
        this.collection.reset();
      });

    });

    describe('setValue', function() {

      beforeEach(function() {
        fc.set('graph', 'scatter');
      });

      it('should return false if no value is passed, or if it\'s isn\'t found', function() {
        var res1 = this.view.setValue();
        var res2 = this.view.setValue('test');
        expect(res1).to.equal(false);
        expect(res2).to.equal(false);
      });

      it('should return the value', function() {
        this.collection.add({ name: 'test' });
        var res = this.view.setValue('test');
        expect(res).to.equal('test');
      });

      it('should disable the new value', function() {
        var model = this.collection.add({ name: 'test' });
        this.view.setValue('test');
        expect(model.attributes.disabled).to.equal(true);
      });

      it('should not re-enable an old value if the option is not found', function() {
        var model = this.collection.add({ name: 'test' });
        this.view.setValue('test');
        this.view.setValue('test2');
        expect(model.attributes.disabled).to.equal(true);
      });

      it('should re-enable the old value', function() {
        var model = this.collection.add({ name: 'test1' });
        this.collection.add({ name: 'test2' });
        this.view.setValue('test1');
        this.view.setValue('test2');
        expect(model.attributes.disabled).to.equal(false);
      });

      it('should trigger \'route:update\' to update the URL', function() {
        this.collection.add({ name: 'test' });
        var spy = sinon.spy();
        Backbone.Events.on('route:update', spy);
        this.view.setValue('test');
        expect(spy).to.have.been.called;
      });

      it('should trigger \'columns:update\' to render the columns', function() {
        this.collection.add({ name: 'test' });
        var spy = sinon.spy();
        Backbone.Events.on('columns:update', spy);
        this.view.setValue('test');
        expect(spy).to.have.been.called;
      });

      afterEach(function() {
        fc.unset('x');
        this.collection.reset();
        fc.unset('graph');
      });

    });

    describe('render', function() {

      before(function() {
        // We reset the view to avoid old triggers
        this.view = new ColumnsItemView({
          el: this.$el,
          collection: this.collection,
          options: {
            name:  'x',
            label: 'x Axis'
          }
        });
      });

      beforeEach(function() {
        fc.set('graph', 'scatter');
      });

      it('should return the view', function() {
        var res = this.view.render(self.collection);
        expect(res).to.equal(this.view);
      });

      it('should render the collection and filter the disabled options', function() {
        this.collection.add([
          { name: 'test', type: 'number', disabled: true },
          { name: 'test2', type: 'string' },
          { name: 'test3', type: 'number' },
        ]);
        this.view.setValue('test3');
        this.view.render();
        // expect(this.$el.html()).to.not.equal(this.template());
        // TODO Doesn't work because of double space and \n
        expect(this.$el.find('option:selected').val()).to.equal('test3');
        expect(this.$el.find('option[value="test"]').prop('disabled')).to.equal(true);
        this.collection.reset();
      });

      it('should trigger \'query:validate\'', function() {
        var spy = sinon.spy();
        Backbone.Events.on('query:validate', spy);
        this.view.render();
        expect(spy).to.have.been.called;
      });

      afterEach(function() {
        fc.unset('chart');
      });

    });

    describe('columns:update', function() {

      before(function() {
        // We reset the view to avoid old triggers
        this.view = new ColumnsItemView({
          el: this.$el,
          collection: this.collection,
          options: {
            name:  'x',
            label: 'x Axis'
          }
        });
      });

      it('should call render with \'columns:render\' event', function() {
        Backbone.Events.trigger('columns:update');
        expect(this.renderSpy).to.have.been.called;
      });

    });

  });

});

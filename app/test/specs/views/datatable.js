define([
  'sinon',
  'backbone',
  'handlebars',
  'views/datatable',
  'text!templates/datatable.handlebars'
], function(sinon, Backbone, Handlebars, DataTableView, TPL) {

  'use strict';

  var expect = chai.expect;


  before(function() {
    this.$table = $('<div></div>');

    this.collection = new (Backbone.Collection.extend({}))();
    this.renderSpy = sinon.spy(DataTableView.prototype, 'render');
    this.view = new DataTableView({
      el: this.$table,
      collection: this.collection
    });
    this.template = Handlebars.compile(TPL);
  });

  describe('DataTable view', function() {

    it('should be instance of DataTableView', function() {
      expect(this.view).to.be.instanceof(DataTableView);
    });

    it('should initialize with an empty template', function() {
      expect(this.$table).to.have.html('');
    });

    describe('render', function() {

      it('should throw an error when argument is not a collection', function() {
        var self = this;
        var call = function() {
          self.view.render('hello');
          self.view.render(123);
          self.view.render({});
          self.view.render([]);
          self.view.render(null);
          self.view.render(undefined);
          self.view.render(new (Backbone.Model.extend({}))());
          self.view.render(new (Backbone.View.extend({}))());
        };
        expect(call).to.throw(TypeError);
      });

      it('should be ok with a collection as argument', function() {
        var self = this;
        var call = function() {
          self.view.render(new (Backbone.Collection.extend({}))());
        };
        expect(call).to.not.throw(TypeError);
      });

      it('should return the view', function() {
        var self = this;
        var call = (function() {
          return self.view.render(self.collection);
        })();
        expect(call).to.equal(this.view);
      });

      it('should render the collection', function() {
        var data = {
          columns: ['x', 'y'],
          rows: [
            [ 1, 2 ],
            [ 3, 4 ],
            [ 5, 6 ]
          ]
        };
        this.collection.add(data);
        this.view.render(this.collection);
        expect(this.$table).to.have.html(this.template({ data: data }));
        this.collection.reset(); // We update the collection
        this.view.render(this.collection);
        expect(this.$table).to.have.html(this.template({ data: {} }));
      });

    });

    describe('collection.sync', function() {

      it('should call render with the collection after it is fetched',
        function() {
        this.collection.trigger('sync', this.collection);
        expect(this.renderSpy).to.have.been.calledWith(this.collection);
      });

    });

  });

  after(function() {
    DataTableView.prototype.render.restore();
  });

});

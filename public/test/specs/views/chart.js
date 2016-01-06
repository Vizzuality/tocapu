define([
  'sinon',
  'backbone',
  'facade',
  'views/chart'
], function(sinon, Backbone, fc, ChartView) {

  'use strict';

  var expect = chai.expect;

  describe('Chart view', function() {

    before(function() {
      this.$chart = $('<div></div>');
      this.collection = new (Backbone.Collection.extend({}))();
      this.renderSpy = sinon.spy(ChartView.prototype, 'render');
      this.view = new ChartView({
        el: this.$chart,
        collection: this.collection
      });
    });

    it('should be instance of ChartView', function() {
      expect(this.view).to.be.instanceof(ChartView);
    });

    it('should initialize with an empty template', function() {
      expect(this.$chart).to.have.html('');
    });

    describe('minMax', function() {

      it('should throw an error when argument is not an array',
        function() {
        var self = this;
        var params = [
          'hello',
          123,
          {},
          null,
          undefined
        ];
        var call = function(param) {
          self.view.minMax(param);
        };
        _.each(params, function(param) {
          var wrapper = function() { call(param); };
          expect(wrapper).to.throw(TypeError);
        });
      });

      it('should throw an error when elements are not numerical', function() {
        var self = this;
        var params = [
          [1, 2, undefined],
          ['hello', 2, 3],
          [1, {}, 3],
          [1, 2, null]
        ];
        var call = function(param) {
          self.view.minMax(param);
        };
        _.each(params, function(param) {
          var wrapper = function() { call(param); };
          expect(wrapper).to.throw(TypeError);
        });
      });

      it('should be ok if we pass a numerical array', function() {
        var self = this;
        var call = function() {
          self.view.minMax([1, 2, .3, 4, 500, 6]);
        };
        expect(call).to.not.throw(TypeError);
      });

      it('should return a correct value', function() {
        var self = this;
        var call = (function() {
          return self.view.minMax([1, 200, .3, -5, -0.76, 200]);
        })();
        expect(call[0]).to.equal(-5);
        expect(call[1]).to.equal(200);
      });

    });

    describe('render', function() {

      it('should throw an error when argument is not a collection', function() {
        var self = this;
        var params = [
          'hello',
          123,
          {},
          [],
          null,
          undefined,
          new (Backbone.View.extend({}))()
        ];
        var call = function(param) {
          self.view.render(param);
        };
        _.each(params, function(param) {
          var wrapper = function() { call(param); };
          expect(wrapper).to.throw(TypeError);
        });
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

      describe('scatter plot', function() {

        before(function() {
          fc.set('graph', 'scatter');
        });

        it('should be ok with an empty collection', function() {
          var self = this;
          var call = function() {
            self.view.render(new (Backbone.Collection.extend({}))());
          };
          expect(call).to.not.throw(TypeError);
        });

        it('should render the collection', function() {
          var data = {
            columns: ['x', 'y', 'density'],
            rows: [
              [ 1, 2, 0 ],
              [ 3, 4, 1 ],
              [ 5, 6, 0 ]
            ]
          };
          this.collection.add(data);
          this.view.render(this.collection);
          expect(this.$chart).to.not.have.html('');
        });

        after(function() {
          fc.unset('graph');
        });

      });

    });

    describe('collection.sync', function() {

      it('should call render with the collection after it is fetched',
        function() {
        this.collection.trigger('sync', this.collection);
        expect(this.renderSpy).to.have.been.calledWith(this.collection);
      });

    });

    after(function() {
      ChartView.prototype.render.restore();
    });

  });

});

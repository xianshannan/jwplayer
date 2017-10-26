import _ from 'utils/underscore';
import utils from 'utils/helpers';
import srt from 'parsers/captions/srt';

class Cue {
  /**
   * @param  {object} obj
   */
  constructor(obj) {
    this.obj = obj;
    // timeslider中的时间，按秒算
    this.time = obj.time;
    // tiemslider中占用大小，按秒算
    this.gap = obj.gap;
    this.text = obj.text;
    this.el = document.createElement('div');
    this.el.className = 'jw-cue jw-reset';
  }

  align(duration) {
    // If a percentage, use it, else calculate the percentage
    if (this.time.toString().slice(-1) === '%') {
      this.left = this.time;
    } else {
      const percentage = this.time / duration * 100;
      this.left = percentage + '%';
      const gapPercentage = this.gap / duration * 100;
      this.width = gapPercentage + '%';
    }
    this.el.style.left = this.left;
    this.el.style.width = this.width;
  }
}

const BrokenMixin = {
  loadBroken: function(file) {
    utils.ajax(file, this.brokenLoaded.bind(this), this.brokenFailed, {
      plainText: true,
    });
  },

  brokenLoaded: function(evt) {
    const data = srt(evt.responseText);
    if (_.isArray(data)) {
      _.each(data, this.addBrokenCue, this);
      this.drawBrokenCues();
    }
  },

  brokenFailed: function() {},

  addBrokenCue: function(obj) {
    obj.begin = obj.begin.replace(/-/g, '/');
    obj.end = obj.end.replace(/-/g, '/');
    if (obj.text === 'duration') {
      this.duration = (+new Date(obj.end) - +new Date(obj.begin)) / 1000;
      // 历史视频的最开始时间
      this.firstBegin = +new Date(obj.begin) / 1000;
      this._model.duration = this.duration;
    } else {
      // timeslider中的时间，按秒算，兼容safari替换‘-’为‘/’
      obj.time = new Date(obj.begin) / 1000 - this.firstBegin;
      // tiemslider中占用大小，按秒算
      obj.gap = (new Date(obj.end) - new Date(obj.begin)) / 1000;
      if (!this._model.broken) {
        this._model.broken = [];
      }
      this._model.broken.push(obj);
      this.brokenCues.push(new Cue(obj));
    }
  },

  drawBrokenCues: function() {
    // We won't want to draw them until we have a duration
    const duration = this._model.get('duration');
    if (!duration || duration <= 0) {
      this._model.once('change:duration', this.drawBrokenCues, this);
      return;
    }
    _.each(this.brokenCues, cue => {
      cue.align(duration);
      cue.el.addEventListener('mouseover', () => {
        this.activeCue = cue;
      });
      cue.el.addEventListener('mouseout', () => {
        this.activeCue = null;
      });
      this.elementRail.appendChild(cue.el);
    });
  },

  resetBroken: function() {
    _.each(this.brokenCues, cue => {
      if (cue.el.parentNode) {
        cue.el.parentNode.removeChild(cue.el);
      }
    });
    this.brokenCues = [];
    this._model.broken = [];
  },
};

export default BrokenMixin;

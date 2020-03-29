
// Bindings utilities

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function WrapperObject() {
}
WrapperObject.prototype = Object.create(WrapperObject.prototype);
WrapperObject.prototype.constructor = WrapperObject;
WrapperObject.prototype.__class__ = WrapperObject;
WrapperObject.__cache__ = {};
Module['WrapperObject'] = WrapperObject;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getCache(__class__) {
  return (__class__ || WrapperObject).__cache__;
}
Module['getCache'] = getCache;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function wrapPointer(ptr, __class__) {
  var cache = getCache(__class__);
  var ret = cache[ptr];
  if (ret) return ret;
  ret = Object.create((__class__ || WrapperObject).prototype);
  ret.ptr = ptr;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;

Module['NULL'] = wrapPointer(0);

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  delete getCache(obj.__class__)[obj.ptr];
}
Module['destroy'] = destroy;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;

// Converts big (string or array) values into a C-style storage, in temporary space

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
var ensureCache = {
  buffer: 0,  // the main buffer of temporary storage
  size: 0,   // the size of buffer
  pos: 0,    // the next free offset in buffer
  temps: [], // extra allocations
  needed: 0, // the total size we need next time

  prepare: function() {
    if (ensureCache.needed) {
      // clear the temps
      for (var i = 0; i < ensureCache.temps.length; i++) {
        Module['_free'](ensureCache.temps[i]);
      }
      ensureCache.temps.length = 0;
      // prepare to allocate a bigger buffer
      Module['_free'](ensureCache.buffer);
      ensureCache.buffer = 0;
      ensureCache.size += ensureCache.needed;
      // clean up
      ensureCache.needed = 0;
    }
    if (!ensureCache.buffer) { // happens first time, or when we need to grow
      ensureCache.size += 128; // heuristic, avoid many small grow events
      ensureCache.buffer = Module['_malloc'](ensureCache.size);
      assert(ensureCache.buffer);
    }
    ensureCache.pos = 0;
  },
  alloc: function(array, view) {
    assert(ensureCache.buffer);
    var bytes = view.BYTES_PER_ELEMENT;
    var len = array.length * bytes;
    len = (len + 7) & -8; // keep things aligned to 8 byte boundaries
    var ret;
    if (ensureCache.pos + len >= ensureCache.size) {
      // we failed to allocate in the buffer, ensureCache time around :(
      assert(len > 0); // null terminator, at least
      ensureCache.needed += len;
      ret = Module['_malloc'](len);
      ensureCache.temps.push(ret);
    } else {
      // we can allocate in the buffer
      ret = ensureCache.buffer + ensureCache.pos;
      ensureCache.pos += len;
    }
    return ret;
  },
  copy: function(array, view, offset) {
    var offsetShifted = offset;
    var bytes = view.BYTES_PER_ELEMENT;
    switch (bytes) {
      case 2: offsetShifted >>= 1; break;
      case 4: offsetShifted >>= 2; break;
      case 8: offsetShifted >>= 3; break;
    }
    for (var i = 0; i < array.length; i++) {
      view[offsetShifted + i] = array[i];
    }
  },
};

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureString(value) {
  if (typeof value === 'string') {
    var intArray = intArrayFromString(value);
    var offset = ensureCache.alloc(intArray, HEAP8);
    ensureCache.copy(intArray, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt8(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP8);
    ensureCache.copy(value, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt16(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP16);
    ensureCache.copy(value, HEAP16, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP32);
    ensureCache.copy(value, HEAP32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF32);
    ensureCache.copy(value, HEAPF32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat64(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF64);
    ensureCache.copy(value, HEAPF64, offset);
    return offset;
  }
  return value;
}


// encoding_options
/** @suppress {undefinedVars, duplicate} */function encoding_options(offset) {
  if (offset && typeof offset === 'object') offset = offset.ptr;
  this.ptr = _emscripten_bind_encoding_options_encoding_options_1(offset);
  getCache(encoding_options)[this.ptr] = this;
};;
encoding_options.prototype = Object.create(WrapperObject.prototype);
encoding_options.prototype.constructor = encoding_options;
encoding_options.prototype.__class__ = encoding_options;
encoding_options.__cache__ = {};
Module['encoding_options'] = encoding_options;

  encoding_options.prototype['get_first_pixel_offset'] = encoding_options.prototype.get_first_pixel_offset = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_encoding_options_get_first_pixel_offset_0(self);
};
    encoding_options.prototype['set_first_pixel_offset'] = encoding_options.prototype.set_first_pixel_offset = /** @suppress {undefinedVars, duplicate} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_encoding_options_set_first_pixel_offset_1(self, arg0);
};
    Object.defineProperty(encoding_options.prototype, 'first_pixel_offset', { get: encoding_options.prototype.get_first_pixel_offset, set: encoding_options.prototype.set_first_pixel_offset });
  encoding_options.prototype['__destroy__'] = encoding_options.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_encoding_options___destroy___0(self);
};
// image
/** @suppress {undefinedVars, duplicate} */function image(data, w, h) {
  ensureCache.prepare();
  if (typeof data == 'object') { data = ensureInt8(data); }
  if (w && typeof w === 'object') w = w.ptr;
  if (h && typeof h === 'object') h = h.ptr;
  this.ptr = _emscripten_bind_image_image_3(data, w, h);
  getCache(image)[this.ptr] = this;
};;
image.prototype = Object.create(WrapperObject.prototype);
image.prototype.constructor = image;
image.prototype.__class__ = image;
image.__cache__ = {};
Module['image'] = image;

image.prototype['pixel_count'] = image.prototype.pixel_count = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  return _emscripten_bind_image_pixel_count_0(self);
};;

  image.prototype['__destroy__'] = image.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_image___destroy___0(self);
};
// pixel_availability
/** @suppress {undefinedVars, duplicate} */function pixel_availability(r, g, b, a) {
  if (r && typeof r === 'object') r = r.ptr;
  if (g && typeof g === 'object') g = g.ptr;
  if (b && typeof b === 'object') b = b.ptr;
  if (a && typeof a === 'object') a = a.ptr;
  this.ptr = _emscripten_bind_pixel_availability_pixel_availability_4(r, g, b, a);
  getCache(pixel_availability)[this.ptr] = this;
};;
pixel_availability.prototype = Object.create(WrapperObject.prototype);
pixel_availability.prototype.constructor = pixel_availability;
pixel_availability.prototype.__class__ = pixel_availability;
pixel_availability.__cache__ = {};
Module['pixel_availability'] = pixel_availability;

  pixel_availability.prototype['__destroy__'] = pixel_availability.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_pixel_availability___destroy___0(self);
};
// ex_helper
/** @suppress {undefinedVars, duplicate} */function ex_helper() {
  this.ptr = _emscripten_bind_ex_helper_ex_helper_0();
  getCache(ex_helper)[this.ptr] = this;
};;
ex_helper.prototype = Object.create(WrapperObject.prototype);
ex_helper.prototype.constructor = ex_helper;
ex_helper.prototype.__class__ = ex_helper;
ex_helper.__cache__ = {};
Module['ex_helper'] = ex_helper;

ex_helper.prototype['get_exception_msg'] = ex_helper.prototype.get_exception_msg = /** @suppress {undefinedVars, duplicate} */function(exptr) {
  var self = this.ptr;
  if (exptr && typeof exptr === 'object') exptr = exptr.ptr;
  return UTF8ToString(_emscripten_bind_ex_helper_get_exception_msg_1(self, exptr));
};;

  ex_helper.prototype['__destroy__'] = ex_helper.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_ex_helper___destroy___0(self);
};
// threshold
/** @suppress {undefinedVars, duplicate} */function threshold(vdt, inv, val, pxav) {
  if (vdt && typeof vdt === 'object') vdt = vdt.ptr;
  if (inv && typeof inv === 'object') inv = inv.ptr;
  if (val && typeof val === 'object') val = val.ptr;
  if (pxav && typeof pxav === 'object') pxav = pxav.ptr;
  this.ptr = _emscripten_bind_threshold_threshold_4(vdt, inv, val, pxav);
  getCache(threshold)[this.ptr] = this;
};;
threshold.prototype = Object.create(WrapperObject.prototype);
threshold.prototype.constructor = threshold;
threshold.prototype.__class__ = threshold;
threshold.__cache__ = {};
Module['threshold'] = threshold;

  threshold.prototype['__destroy__'] = threshold.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_threshold___destroy___0(self);
};
// VoidPtr
/** @suppress {undefinedVars, duplicate} */function VoidPtr() { throw "cannot construct a VoidPtr, no constructor in IDL" }
VoidPtr.prototype = Object.create(WrapperObject.prototype);
VoidPtr.prototype.constructor = VoidPtr;
VoidPtr.prototype.__class__ = VoidPtr;
VoidPtr.__cache__ = {};
Module['VoidPtr'] = VoidPtr;

  VoidPtr.prototype['__destroy__'] = VoidPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_VoidPtr___destroy___0(self);
};
// steganographer
/** @suppress {undefinedVars, duplicate} */function steganographer(img) {
  if (img && typeof img === 'object') img = img.ptr;
  this.ptr = _emscripten_bind_steganographer_steganographer_1(img);
  getCache(steganographer)[this.ptr] = this;
};;
steganographer.prototype = Object.create(WrapperObject.prototype);
steganographer.prototype.constructor = steganographer;
steganographer.prototype.__class__ = steganographer;
steganographer.__cache__ = {};
Module['steganographer'] = steganographer;

steganographer.prototype['add_threshold'] = steganographer.prototype.add_threshold = /** @suppress {undefinedVars, duplicate} */function(thres, apply) {
  var self = this.ptr;
  if (thres && typeof thres === 'object') thres = thres.ptr;
  if (apply && typeof apply === 'object') apply = apply.ptr;
  _emscripten_bind_steganographer_add_threshold_2(self, thres, apply);
};;

steganographer.prototype['clear_thresholds'] = steganographer.prototype.clear_thresholds = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_steganographer_clear_thresholds_0(self);
};;

steganographer.prototype['available_size_bytes'] = steganographer.prototype.available_size_bytes = /** @suppress {undefinedVars, duplicate} */function(eopts) {
  var self = this.ptr;
  if (eopts && typeof eopts === 'object') eopts = eopts.ptr;
  return _emscripten_bind_steganographer_available_size_bytes_1(self, eopts);
};;

steganographer.prototype['encode'] = steganographer.prototype.encode = /** @suppress {undefinedVars, duplicate} */function(data, len, eopts) {
  var self = this.ptr;
  ensureCache.prepare();
  if (typeof data == 'object') { data = ensureInt8(data); }
  if (len && typeof len === 'object') len = len.ptr;
  if (eopts && typeof eopts === 'object') eopts = eopts.ptr;
  return wrapPointer(_emscripten_bind_steganographer_encode_3(self, data, len, eopts), image);
};;

  steganographer.prototype['__destroy__'] = steganographer.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} */function() {
  var self = this.ptr;
  _emscripten_bind_steganographer___destroy___0(self);
};
(function() {
  function setupEnums() {
    

    // visual_data_type

    Module['CHANNEL_RED'] = _emscripten_enum_visual_data_type_CHANNEL_RED();

    Module['CHANNEL_GREEN'] = _emscripten_enum_visual_data_type_CHANNEL_GREEN();

    Module['CHANNEL_BLUE'] = _emscripten_enum_visual_data_type_CHANNEL_BLUE();

    Module['CHANNEL_ALPHA'] = _emscripten_enum_visual_data_type_CHANNEL_ALPHA();

    Module['AVERAGE_RGB'] = _emscripten_enum_visual_data_type_AVERAGE_RGB();

    Module['AVERAGE_RGBA'] = _emscripten_enum_visual_data_type_AVERAGE_RGBA();

    Module['SATURATION'] = _emscripten_enum_visual_data_type_SATURATION();

    Module['LUMINANCE'] = _emscripten_enum_visual_data_type_LUMINANCE();

    Module['CHANNEL_SUM_SATURATED'] = _emscripten_enum_visual_data_type_CHANNEL_SUM_SATURATED();

  }
  if (runtimeInitialized) setupEnums();
  else addOnPreMain(setupEnums);
})();
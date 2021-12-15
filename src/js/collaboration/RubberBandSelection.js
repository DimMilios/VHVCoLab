export class RubberBandSelection {
  coords = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };

  isSelecting = false;

  selectAreaElem = document.querySelector('#select-area');

  constructor(coords) {
    this.coords = coords ?? this.coords;

    if (!this.selectAreaElem) {
      this.selectAreaElem = document.createElement('div');
      this.selectAreaElem.id = 'select-area';
      document.body.appendChild(this.selectAreaElem);
    }
  }

  /**
   * Update the position new position of the selection area DOM element
   *
   * @returns {{ left: number, top: number, right: number, bottom: number }} The new coordinates of the DOM element
   */
  updateElemPosition() {
    let { left, top, right, bottom } = this.coords;
    let minX = Math.min(left, right);
    let maxX = Math.max(left, right);
    let minY = Math.min(top, bottom);
    let maxY = Math.max(top, bottom);

    this.selectAreaElem.style.transform = `translate(${minX}px, ${minY}px)`;
    this.selectAreaElem.style.width = maxX - minX + 'px';
    this.selectAreaElem.style.height = maxY - minY + 'px';

    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
    };
  }

  /**
   * Update the internal coordinates state of the object with
   * the position of the selection area DOM element
   *
   * @returns {{ left: number, top: number, right: number, bottom: number }} The new coordinates of the current object
   */
  reCalculateCoords() {
    return (this.coords = this.updateElemPosition());
  }

  resetCoords() {
    this.coords = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };
    this.updateElemPosition();
  }

  /**
   * Find every element of the array that is within the bounds of the selection
   * area DOM element
   *
   * @param {Element[]} elements
   * @returns {Element[]}
   */
  selectNoteElements(elements) {
    return elements.filter((elem) => {
      const box = elem.getBoundingClientRect();

      return (
        this.coords.left <= box.left &&
        this.coords.top <= box.top &&
        this.coords.right >= box.right &&
        this.coords.bottom >= box.bottom
      );
    });
  }
}

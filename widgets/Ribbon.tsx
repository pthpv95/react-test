import React from 'react';
import styled from 'styled-components';

const RibbonWrapper = styled.div`
.box {
  width: 200px; height: 300px;
  position: relative;
  border: 1px solid #BBB;
  background: #EEE;
}
.ribbon {
  position: absolute;
  right: -5px; top: -5px;
  z-index: 11;
  overflow: hidden;
  width: 75px; height: 75px;
  text-align: right;
}

.ribbon span {
  font-size: 10px;
  font-weight: bold;
  color: #FFF;
  text-transform: uppercase;
  text-align: center;
  line-height: 20px;
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  width: 100px;
  display: block;
  background: #79A70A;
  background: linear-gradient(#9BC90D 0%, #79A70A 100%);
  box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
  position: absolute;
  top: 19px; right: -21px;
}
.ribbon span::before {
  content: "";
  position: absolute; left: 0px; top: 100%;
  z-index: -1;
  border-left: 3px solid #79A70A;
  border-right: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-top: 3px solid #79A70A;
}
.ribbon span::after {
  content: "";
  position: absolute; right: 0px; top: 100%;
  z-index: -1;
  border-left: 3px solid transparent;
  border-right: 3px solid #79A70A;
  border-bottom: 3px solid transparent;
  border-top: 3px solid #79A70A;
}`;
const Ribbon = ({ text }: { text: string }) => {
  return (
    <RibbonWrapper>
      <div className='ribbon'>
        <span>{text}</span>
      </div>
    </RibbonWrapper>
  );
};

export default Ribbon;
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'

import './Header.scss'

function Header() {
  return (
    <div className='Header'>
      <div className="profile">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc0_MD3bH1uwc7le9pgriZUQ5NqIXohjDO_aDYh6TJmJFpkfNq0sKfaK9AnLBSAQvIiwM&usqp=CAU" />
        <div className="info">
          <h3>John Doe</h3>
          <small>Renda mensal: <strong>R$4.000</strong></small>
        </div>
      </div>
    </div>
  )
}

export default Header

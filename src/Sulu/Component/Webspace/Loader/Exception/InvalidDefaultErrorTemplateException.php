<?php
/*
 * This file is part of Sulu.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Webspace\Loader\Exception;

/**
 * This error represents a wrong default error template configuration
 */
class InvalidDefaultErrorTemplateException extends WebspaceException
{
    /**
     * InvalidErrorTemplateException constructor.
     */
    public function __construct()
    {
        parent::__construct('Default cannot be false if no code is defined');
    }
}

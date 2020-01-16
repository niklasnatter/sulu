<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Rest;

use FOS\RestBundle\View\View;
use Sulu\Bundle\CoreBundle\Entity\ApiEntity;
use Sulu\Component\Rest\Exception\EntityNotFoundException;
use Sulu\Component\Rest\Exception\RestException;
use Symfony\Component\HttpFoundation\Request;

trait GetUserTrait
{
    protected function getUser(): object
    {
        if (!$this->tokenStorage) {
            throw new \LogicException('The TokenStorage instance property is not set.');
        }

        $token = $this->tokenStorage->getToken();
        if (null === $token) {
            return null;
        }

        $user = $token->getUser();
        if (!is_object($user)) {
            // e.g. anonymous authentication
            return null;
        }

        return $user;
    }
}

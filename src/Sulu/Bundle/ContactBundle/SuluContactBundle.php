<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\ContactBundle;

use Sulu\Bundle\ContactBundle\Entity\AccountInterface;
use Sulu\Bundle\ContactBundle\Entity\AccountRepositoryInterface;
use Sulu\Bundle\ContactBundle\Entity\ContactInterface;
use Sulu\Bundle\ContactBundle\Entity\ContactRepositoryInterface;
use Sulu\Bundle\PersistenceBundle\PersistenceBundleTrait;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class SuluContactBundle extends Bundle
{
    use PersistenceBundleTrait;

    public function build(ContainerBuilder $container)
    {
        parent::build($container);

        $this->buildPersistence(
            [
                ContactInterface::class => 'sulu.model.contact.class',
                AccountInterface::class => 'sulu.model.account.class',
            ],
            $container
        );

        $container->addAliases(
            [
                ContactRepositoryInterface::class => 'sulu.repository.contact',
                AccountRepositoryInterface::class => 'sulu.repository.account',
            ]
        );
    }
}
